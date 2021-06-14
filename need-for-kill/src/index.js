
import { Map } from './Map.js'
import { ResourcesD } from './ResourcesD.js'
import { Player, PLAYER_STATE, PLAYER_CTRL_STATE } from './Player.js'
import { PlayerModel } from './PlayerModel.js'
import { fetchUint8Array, fetchText, getDirname, loadImageEx, createCanvasCtx } from './Utils/Utils.js'
import { SpriteGrid } from './Classes/SpriteGrid.js'
import { SpriteGridAnim } from './Classes/SpriteGridAnim.js'
import { Sprite } from './Classes/Sprite.js'
import { setContext, updateFrameTime, drawSprite } from './Render.js'
import { addGameObject, getGameObjectListByObjectID, getGameObjectList } from './GameObjectMgr.js'
import { GameObject } from './GameObject.js'
import { IDBrick, IDItem, IDPlayer, IDBullet, IDParticle } from './ObjectID.js'
import { Brick } from './Brick.js'
import { Item } from './Item.js'
import { Ammo } from './Ammo.js'
import { Weapon } from './Weapon.js'
import { Armor, Armor5 } from './Armor.js'
import { Fine } from './Fine.js'
import { Health, HealthMega } from './Health.js'
import { setWorkDir } from './PathMgr.js'
import { addResources } from './ResourceMgr.js'
import { Stats } from './lib/statsjs/index.js'
import * as vec2 from './lib/glmatrix/vec2.js'

function drawMap(map, res, player) {
	const stats = new Stats()
	stats.showPanel( 0 ) // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( stats.dom )

	const { cnv, ctx } = createCanvasCtx(map.header.mapSizeX * 32, map.header.mapSizeY * 16)
	setContext(cnv, ctx)

	const _devDrawBBox = 0

	const canvas = cnv
	document.body.appendChild(cnv)
	globalThis.ctx = ctx
	globalThis.cnv = cnv

	const bgIndex = map.header.bg ? map.header.bg : 1
	const bg  = map.customBg ?? res.get('bg_' + bgIndex)
	const sBg = new Sprite(bg.cnv)

	const sgBricks   = new SpriteGrid(res.get('bricks_t').cnv, 32, 16)
	const sgBricks2  = new SpriteGrid(res.get('bricks_t2').cnv, 32, 16)
	const sgStatic   = map.pal ? 
		new SpriteGrid(map.pal.img, 32, 16) :
		sgBricks.concat(sgBricks2)

	const drawFnList = []
	map.bbb.map((row, y) => {
		y = cnv.height - y*16 - 16
		row.map((brickIndex, x) => {
			x = x*32
			const cx = x + 32/2
			
			if ( !brickIndex )
				return
			
			if ( brickIndex >= 54 )
				return new Brick(cx, y, brickIndex, sgStatic)
			
			if ( (brickIndex >= 1 && brickIndex <= 1 + 6) )
				return new Weapon(cx, y, brickIndex)
			
			if ( (brickIndex >= 8 && brickIndex <= 8 + 7) )
				return new Ammo(cx, y, brickIndex)
			
			if ( brickIndex >= 23 && brickIndex <= 28 )
				return new Fine(cx, y, brickIndex)
			
			if ( brickIndex >= 17 && brickIndex <= 18 )
				return new Armor(cx, y, brickIndex)
			
			if ( brickIndex == 16 )
				return new Armor5(cx, y, brickIndex)
			
			if ( brickIndex >= 19 && brickIndex <= 21 )
				return new Health(cx, y, brickIndex)

			if ( brickIndex == 22 )
				return new HealthMega(cx, y, brickIndex)

			if ( brickIndex === 34 ) {
				player.pos[0] = cx
				player.pos[1] = y
				return
			}
			
			drawFnList.push(() => ctx.fillText(brickIndex, cx - 4, cnv.height - y - 16 + 12))
		})
	})

	const drawBackground = () => {
		const bgIndex = map.header.bg ? map.header.bg : 1
		const bg = map.customBg ?? res.get('bg_' + bgIndex)
		for(let y = 0; y < canvas.width; y += bg.cnv.width)
			for(let x = 0; x < canvas.width; x += bg.cnv.width)
				drawSprite(sBg, x, y)
	}
	
	const drawBricksStatic = () => 
		getGameObjectListByObjectID(IDBrick)
			.map(brick => ( brick.draw(), _devDrawBBox && brick.drawBBox() ))
	
	const drawBricksItem = () =>
		getGameObjectListByObjectID(IDItem)
			.map(brick => ( brick.draw(), _devDrawBBox && brick.drawBBox() ))

	const drawPlayers = () =>
		getGameObjectListByObjectID(IDPlayer)
			.map(player => ( player.draw(), _devDrawBBox && player.drawBBox() ))
		
	const draw = () => {
		requestAnimationFrame(draw)
		
		stats.begin()
		
			updateFrameTime()
			
			getGameObjectList()
				.map(go => go.update())
				
			drawBackground()		
			drawBricksStatic()
			drawBricksItem()
			drawPlayers()
			
			getGameObjectListByObjectID(IDBullet).map(player => ( player.draw(), _devDrawBBox && player.drawBBox() ))
			getGameObjectListByObjectID(IDParticle).map(player => ( player.draw(), _devDrawBBox && player.drawBBox() ))

			//drawFnList.map(f => f())
		
		stats.end()
	}
	draw()
}

async function main() {
	setWorkDir( /127|local/i.test(location.hostname) ? './' : './resources/' )
		
	const map = new Map()
	await map.load( `basenfk/maps/dm13-test.mapa` )
	//await map.load( `basenfk/maps/test.mapa` )
	//await map.load( `basenfk/maps/Capture_The_Flag/zef1.mapa` )
	//await map.load( `basenfk/maps/dm0.mapa` )
	
	const resources = new ResourcesD()
	await resources.load(`basenfk/system/graph.d`)
	await resources.load(`basenfk/system/graph2.d`)	
	
	addResources(resources)
	
	const playerModel = new PlayerModel()
	await playerModel.load(`basenfk/models/doom/dark.nmdl`)

	const player = new Player(playerModel)
	
	globalThis.map = map
	globalThis.resources = resources
	globalThis.playerModel = playerModel
	globalThis.player = player
	globalThis.vec2 = vec2
	
	drawMap(map, resources, player)
	
	//////////////////
	const _keyMap = {
		65: PLAYER_STATE.LookLeft  | PLAYER_STATE.Move,
		68: PLAYER_STATE.LookRight | PLAYER_STATE.Move,
		83: PLAYER_STATE.Crouch,
		87: PLAYER_STATE.Jump,
	}
	
	const keyMap = {
		65: PLAYER_CTRL_STATE.Left,
		68: PLAYER_CTRL_STATE.Right,
		83: PLAYER_CTRL_STATE.Down,
		87: PLAYER_CTRL_STATE.Up,
	}

	window.addEventListener('keydown', event => player.addCtrlState( keyMap[ event.which ] | 0 ) )
	window.addEventListener('keyup'  , event => player.delCtrlState( keyMap[ event.which ] | 0 ) )
	
	window.addEventListener('mousedown', event => player.addCtrlState( PLAYER_CTRL_STATE.Attack ) )
	window.addEventListener('mouseup'  , event => player.delCtrlState( PLAYER_CTRL_STATE.Attack ) )
	
	window.addEventListener('mousemove', event => player.addWeaponAngle( event.movementY / window.innerHeight * 5 ) )
	//////////////////
}

window.addEventListener('load', main)

