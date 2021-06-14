
import { GameObject } from './GameObject.js'
import { drawSpriteCX, getFrameTimeSec, getFrameDeltaTimeSec, getFrameTime, getContext } from './Render.js'
import * as vec2 from './lib/glmatrix/vec2.js'
import { IDPlayer, IDBrick, IDItem } from './ObjectID.js'
import { BBox } from './Classes/BBox.js'
import { getCollisions, getCollisionsBBox } from './GameObjectMgr.js'
import { playSound } from './SoundMgr.js'
import { setTimeout } from './Render.js'
import { getCacheResource, getResource } from './ResourceMgr.js'
import { SpriteGrid } from './Classes/SpriteGrid.js'
import { SpriteGridAnim } from './Classes/SpriteGridAnim.js'

import { Bullet } from './Bullet.js'


const PLAYER_STATE_IDLE       = 0b1
const PLAYER_STATE_MOVE       = 0b10
const PLAYER_STATE_JUMP       = 0b100

const PLAYER_STATE_LOOK_LEFT  = 0b1000
const PLAYER_STATE_LOOK_RIGHT = 0b10000

const PLAYER_STATE_STANDING   = 0b100000
const PLAYER_STATE_CROUCH     = 0b1000000
const PLAYER_STATE_DIE        = 0b10000000

export const PLAYER_STATE = {
	Idle     : PLAYER_STATE_IDLE,
	Move     : PLAYER_STATE_MOVE,
	Jump     : PLAYER_STATE_JUMP,
	
	LookLeft : PLAYER_STATE_LOOK_LEFT,
	LookRight: PLAYER_STATE_LOOK_RIGHT,

	Standing : PLAYER_STATE_STANDING,
	Crouch   : PLAYER_STATE_CROUCH,
	Die      : PLAYER_STATE_DIE,
}

const PlayerStateGroups = [
	{
		mask   : PLAYER_STATE_IDLE | PLAYER_STATE_MOVE | PLAYER_STATE_JUMP,
		default: PLAYER_STATE_IDLE,
	},
	{
		mask   : PLAYER_STATE_LOOK_LEFT | PLAYER_STATE_LOOK_RIGHT,
		default: PLAYER_STATE_LOOK_RIGHT,
	},
	{
		mask   : PLAYER_STATE_STANDING | PLAYER_STATE_CROUCH | PLAYER_STATE_DIE,
		default: PLAYER_STATE_STANDING,
	},
]

export const PLAYER_CTRL_STATE = {
	Up    : 0b1,
	Down  : 0b10,
	Left  : 0b100,
	Right : 0b1000,
	Attack: 0b10000,
}

globalThis.PLAYER_STATE = PLAYER_STATE
globalThis.PLAYER_CTRL_STATE = PLAYER_CTRL_STATE

class ActionLoop {
	startTime = getFrameTimeSec()

	update(numPerSec, callback) {
		const reloadTime = 1 / numPerSec
		
		if ( this.startTime > getFrameTimeSec() )
			return
		
		this.startTime = getFrameTimeSec() + reloadTime
		callback()
	}
}

export class Player extends GameObject {
	sg = getCacheResource( 'Player_sdf34bfd', () => {
		return new SpriteGrid(getResource('item').cnv, 32, 16)
	})
	sgWeapon = getCacheResource( 'PlayerWeapon_f39hte', () => {
		const sg = new SpriteGrid(getResource('item').cnv, 32, 16)
	})
	
	sgWeaponMgun = getCacheResource( 'PlayerWeaponMgun_h94jbnd', () => {
		const sg = new SpriteGrid(getResource('mgun_ex').cnv, 39, 13, 1e9, 3)
		const sgaExplositon = new SpriteGridAnim( new SpriteGrid(getResource('explosion').cnv, 32, 32, 8), 30 )
		return {
			base: sg.slice(0, 1),
			attack: sg.slice(1, 1 + 6),
			sgaExplositon
		}
	})
	
	
	pos = { x: 0, y: 0}
	playerModel = null
	state = PLAYER_STATE_IDLE | PLAYER_STATE_LOOK_RIGHT | PLAYER_STATE_STANDING
	ctrlState = 0
	
	pos = [32*6, 16*16]
	velocity = [0, 0]
	
	ani = null
	stopAni = true
	
	hp = 100
	armor = 0

	constructor(playerModel) {
		const x = 32*6
		const y = 16*16
		super(IDPlayer, [x, y], new BBox(x-10, y, x+10, y+50))

		this.playerModel = playerModel
		this.updateAni()
	}
	
	setState(state) {
		if ( this.state !== state ) {
			this.state = state
			this.updateAni()
		}
	}
	addState(state) {
		let prevState = this.state
		for(const g of PlayerStateGroups) {
			const localState = state & g.mask
			if ( localState ) {
				prevState &= ~g.mask
				prevState |= localState
			}
		}

		this.setState(prevState)
	}
	delState(state) {
		let prevState = this.state
		for(const g of PlayerStateGroups) {
			const localState = state & g.mask
			if ( localState ) {
				prevState &= ~localState
				if ( !(prevState & g.mask) )
					prevState |= g.default
			}
		}

		this.setState(prevState)
	}
	clearState() {
		this.setState(PLAYER_STATE.Idle)
	}
	getStateStr() {
		return Object
			.keys(PLAYER_STATE)
			.map(k => this.state & PLAYER_STATE[k] ? k : '')
			.filter(Boolean)
			.join(', ')
	}
	
	addCtrlState(ctrlState) {
		this.ctrlState |= ctrlState
	}
	delCtrlState(ctrlState) {
		this.ctrlState &= ~ctrlState
	}
	
	updateAni() {
		console.log( this.getStateStr() )
		let lookName = 'right'
		let ani = this.playerModel.walk
		this.stopAni = true
		
		if ( this.state & PLAYER_STATE.LookLeft )
			lookName = 'left'
		
		if ( this.state & PLAYER_STATE.Standing )
			ani = this.playerModel.walk
		
		if ( this.state & PLAYER_STATE.Crouch )
			ani = this.playerModel.crouch
		
		if ( this.state & PLAYER_STATE.Die )
			ani = this.playerModel.die
		
		if ( this.state & PLAYER_STATE.Move )
			this.stopAni = false
		
		this.ani = ani[ lookName ]
		
		this.startAniTime = Date.now()
	}
	
	calcBBox(bbox, pos, forceStanding = false) {
		bbox.min[0] = pos[0] - 10
		bbox.max[0] = pos[0] + 10
		bbox.min[1] = pos[1]
		
		const height = ( forceStanding || !(this.state & PLAYER_STATE.Crouch) ) ? 47 : 31
		bbox.max[1] = pos[1] + height		
	}
	updateBBox() {
		this.calcBBox(this.bbox, this.pos)
	}
	isHasCollisions(newPos, forceStanding = false) {
		const bbox = new BBox()
		this.calcBBox(bbox, [newPos[0], newPos[1]+0.1], forceStanding)
		return this.isHasCollisionsBBox(bbox)
	}
	isHasCollisionsBBox(bbox) {
		return getCollisionsBBox(bbox)
			.filter(v => v.objectID === IDBrick)
			.length !== 0		
	}
	isStandingOnSurface() {
		const newPos = [this.pos[0], this.pos[1] - 0.1]
		return this.isHasCollisions(newPos)
	}
	
	updateExternalCollisions() {
		getCollisionsBBox(this.bbox)
			.filter(v => v.objectID === IDItem)
			.map(v => v.intersection(this))
	}
	update() {
		this.updateBBox()
		
		if ( getFrameDeltaTimeSec() > 0.1 )
			return
		
		let lrVec = [0, 0]
		if ( this.ctrlState & PLAYER_CTRL_STATE.Right ) {
			this.addState( PLAYER_STATE.LookRight | PLAYER_STATE.Move )
			lrVec = [+100, 0]
		} else
		if ( this.ctrlState & PLAYER_CTRL_STATE.Left ) {
			this.addState( PLAYER_STATE.LookLeft | PLAYER_STATE.Move )
			lrVec = [-100, 0]
		} else 
			this.delState( PLAYER_STATE.Move )
		
		if ( this.ctrlState & PLAYER_CTRL_STATE.Down ) {
			this.addState( PLAYER_STATE.Crouch )
		} else {
			if ( this.isHasCollisions(this.pos, true) )
				this.addState( PLAYER_STATE.Crouch )
			else {
				this.delState( PLAYER_STATE.Crouch )
			}
		}
		
		
		let newPos
		{
			newPos = vec2.add([], this.pos, vec2.scale([], lrVec, getFrameDeltaTimeSec()))
			if ( !this.isHasCollisions(newPos) )
				this.pos = newPos
		}
		
		const velocity = this.velocity
		velocity[1] -= 200 * getFrameDeltaTimeSec()
		newPos = vec2.add([], this.pos, vec2.scale([], velocity, getFrameDeltaTimeSec()))
			
		if ( !this.isHasCollisions(newPos)) {
			this.pos = newPos
		} else {
			this.velocity[1] = 0
		}
		
		if ( this.ctrlState & PLAYER_CTRL_STATE.Up ) {
			if ( this.isStandingOnSurface() ) {
				vec2.add(this.velocity, this.velocity, vec2.scale([], [0, 10000*1.2], getFrameDeltaTimeSec()))
			}
		}
		
		this.updateExternalCollisions()
	}

	draw() {
		//this.update()
		
		const now = Date.now()
		const frameTime = now - this.prevFrameTime
		this.prevFrameTime = now
		
		const aniTime = now - this.startAniTime

		let aniIndex = (aniTime / (this.ani.frameRefreshTime * 15)) | 0
		
		if ( this.stopAni )
			aniIndex = 0

		const sprite = this.ani.frames[ aniIndex % this.ani.frames.length ]
		
		const x = 32*6
		const y = 16*16
		drawSpriteCX(sprite, this.pos[0], this.pos[1])
		
		this.drawWeapon()
	}
	
	weaponId = 1
	weaponAngle = 0
	addWeaponAngle(_weaponAngle) {
		this.weaponAngle += _weaponAngle
		this.weaponAngle = Math.min( Math.PI / 2, Math.max( -Math.PI / 2, this.weaponAngle ) )
	}
	
	weaponStartAttackTime = 0
	weaponNumAttackPerSec = 100
	weaponAttackLoop = new ActionLoop()
	weaponAttackAniSeq = 0
	weaponAttackAniRate = 0
	drawWeapon() {
		let isWeaponAttack = false
		if ( this.ctrlState & PLAYER_CTRL_STATE.Attack ) {
			this.weaponAttackLoop.update(this.weaponNumAttackPerSec, () => {
				isWeaponAttack = true
			})
		}
		
		const { ctx, cnv } = getContext()
		
		const height = this.state & PLAYER_STATE.Crouch ? 17 : 26
		
		const drawSpriteSimplie = sprite => {
			ctx.drawImage(
				sprite.texture, 
				sprite.x, sprite.y, sprite.width, sprite.height,			
				0,0, sprite.width, sprite.height
			)
		}
		
		
		
		let itemHeight = 13
		ctx.save()

		globalThis.__a = globalThis.__a|| 0
		if ( globalThis.__a >= 90 ) globalThis.__da = -1
		if ( globalThis.__a <= -90 ) globalThis.__da = 1
		globalThis.__a += globalThis.__da || 1
		
		if ( this.state & PLAYER_STATE.LookLeft ) {
			ctx.scale(-1, 1)
			ctx.translate(-this.pos[0], 0)
		} else {
			ctx.translate( this.pos[0], 0)
		}

		ctx.translate(0, cnv.height - itemHeight - (this.pos[1] + height - 10) )
		ctx.translate(-20, -5)

		const [rx, ry] = [20, 5]
		ctx.translate(+rx, +ry)
		ctx.rotate(this.weaponAngle)
		ctx.translate(-rx, -ry)

		drawSpriteSimplie( this.sgWeaponMgun.base.frames[0] )
		
		if ( this.ctrlState & PLAYER_CTRL_STATE.Attack )
			this.weaponAttackAniRate = 30
		
		
		this.weaponAttackAniSeq += getFrameDeltaTimeSec() * this.weaponAttackAniRate
		const i = Math.floor( this.weaponAttackAniSeq ) % this.sgWeaponMgun.attack.frames.length
		drawSpriteSimplie( this.sgWeaponMgun.attack.frames[ i ] )
		
		this.weaponAttackAniRate /= 1.03
		if ( this.weaponAttackAniRate < 15 )
			this.weaponAttackAniRate = 0

		if ( isWeaponAttack ) {
			const sprite = this.sgWeaponMgun.sgaExplositon.spriteGrid.frames[ this.sgWeaponMgun.sgaExplositon.getFrameIndex() ]
				
			ctx.translate(35, 0)
			
			const [rx, ry] = [6, 6]
			ctx.translate(+rx, +ry)
			ctx.rotate(Math.PI * Math.random())
			ctx.translate(-rx, -ry)
			
			ctx.drawImage(
				sprite.texture, 
				sprite.x, sprite.y, sprite.width, sprite.height,			
				0,0, 12, 12
			)
		}



		ctx.restore()

		if ( isWeaponAttack )
			this.weaponAttack()
	}
	weaponAttack() {
		playSound('basenfk/sound/machine.wav')
		
		let a = ( this.state & PLAYER_STATE.LookLeft ) ? 
			-this.weaponAngle - Math.PI : 
			this.weaponAngle
		
		a += (Math.random() * 2 - 1) * Math.PI / 180 * 1
		
		const height = this.state & PLAYER_STATE.Crouch ? 19 : 28
		new Bullet(this.pos[0], this.pos[1] + height, -a)
	}
}
