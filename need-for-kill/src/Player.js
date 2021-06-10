
import { GameObject } from './GameObject.js'
import { drawSpriteCX, getFrameDeltaTimeSec } from './Render.js'
import * as vec2 from './lib/glmatrix/vec2.js'
import { IDPlayer, IDBrick, IDItem } from './ObjectID.js'
import { BBox } from './Classes/BBox.js'
import { getCollisions, getCollisionsBBox } from './GameObjectMgr.js'


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
	Up   : 0b1,
	Down : 0b10,
	Left : 0b100,
	Right: 0b1000,
}

globalThis.PLAYER_STATE = PLAYER_STATE
globalThis.PLAYER_CTRL_STATE = PLAYER_CTRL_STATE

export class Player extends GameObject {
	pos = { x: 0, y: 0}
	playerModel = null
	state = PLAYER_STATE_IDLE | PLAYER_STATE_LOOK_RIGHT | PLAYER_STATE_STANDING
	ctrlState = 0
	
	pos = [32*6, 16*16]
	velocity = [0, 0]
	
	ani = null
	stopAni = true

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
		
		const height = ( forceStanding || !(this.state & PLAYER_STATE.Crouch) ) ? 40 : 30
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

	draw(ctx) {
		this.update()
		
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
	}
}
