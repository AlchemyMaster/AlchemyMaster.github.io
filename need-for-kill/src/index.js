
import { Map } from './Map.js'
import { ResourcesD } from './ResourcesD.js'
import { Player, PLAYER_STATE, PLAYER_CTRL_STATE } from './Player.js'
import { PlayerModel } from './PlayerModel.js'
import { fetchUint8Array, fetchText, getDirname, loadImageEx, createCanvasCtx } from './Utils/Utils.js'
import { SpriteGrid } from './Classes/SpriteGrid.js'
import { SpriteGridAnim } from './Classes/SpriteGridAnim.js'
import { setContext, updateFrameTime } from './Render.js'
import { addGameObject, getGameObjectListByObjectID } from './GameObjectMgr.js'
import { GameObject } from './GameObject.js'
import { IDBrick, IDItem, IDPlayer } from './ObjectID.js'
import { Brick } from './Brick.js'
import { Item } from './Item.js'

function drawMap(map, res, player) {	
	const { cnv, ctx } = createCanvasCtx(map.header.mapSizeX * 32, map.header.mapSizeY * 16)
	setContext(cnv, ctx)

	const _devDrawBBox = false

	const canvas = cnv
	document.body.appendChild(cnv)
	globalThis.ctx = ctx
	
	const sgStatic   = new SpriteGrid(map.pal.img, 32, 16)
	
	const sgItems    = new SpriteGrid(res.get('item').cnv, 32, 16)
	
	const sgArmors   = new SpriteGrid(res.get('armors').cnv, 32, 16, 40)
	const sgaArmorsY = new SpriteGridAnim(sgArmors.slice(0 , 20), 12)
	const sgaArmorsR = new SpriteGridAnim(sgArmors.slice(20, 40), 12)

	const sgaFineMap = Object.fromEntries(
		[ [23, 'fine_regen'], [26, 'fine_quad'], [28, 'fine_invis'], [24, 'fine_battle'], [25, 'fine_haste'], [27, 'fine_fly'], ]
		.map(v => [v[0], new SpriteGridAnim(
			new SpriteGrid(res.get(v[1]).cnv, 37, 32, 20, 6),
			12
		)])
	)
	
	const sgaFineMega = new SpriteGridAnim( new SpriteGrid(res.get('fine_mega').cnv, 32, 32, 15), 12 )


	map.bbb.map((row, y) => {
		y = cnv.height - y*16 - 16
		row.map((brickIndex, x) => {
			x = x*32
			
			if ( !brickIndex )
				return
			
			if ( brickIndex >= 54 )
				return new Brick(x, y, brickIndex, sgStatic)

			if ( (brickIndex >= 1 && brickIndex <= 16) || (brickIndex >= 19 && brickIndex <= 21) )
				return new Item(x+7, y, 32-14, 16-6, brickIndex, () => sgItems.draw(ctx, brickIndex, x, y))
			
			if ( sgaFineMap[brickIndex] )
				return new Item(x+6, y+6, 32-6*2, 32-6*2, brickIndex, () => sgaFineMap[brickIndex].draw(ctx, x, y) )
			
			if ( brickIndex == 22 )
				return new Item(x + 8, y, 16, 16, brickIndex, () => sgaFineMega.drawEx(ctx, x + 8, y, 16, 16) )
			
			if ( brickIndex == 17 )
				return new Item(x + 7, y, 18, 32, brickIndex, () => sgaArmorsY.draw(ctx, x, y + 8) )
				
			if ( brickIndex == 18 )
				return new Item(x + 7, y, 18, 32, brickIndex, () => sgaArmorsR.draw(ctx, x, y + 8) )
			
			//bricksItem.push({ draw: () => ctx.fillText(brickIndex, x*32 + 16, y*16 + 8) })
		})			
	})
	
	const drawBackground = () => {
		const bg = map.customBg ?? res.get('bg_' + map.header.bg)
		for(let y = 0; y < canvas.width; y += bg.cnv.width)
			for(let x = 0; x < canvas.width; x += bg.cnv.width)
				ctx.drawImage(bg.cnv, x, y)
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
		
		updateFrameTime()
		
		drawBackground()		
		drawBricksStatic()
		drawBricksItem()
		drawPlayers()
	}
	draw()
}

async function main() {
	const resourcesDir = ( /127|local/i.test(location.hostname) ) ? './' : './resources/'
		
	const map = new Map()
	await map.load( `${ resourcesDir }basenfk/maps/dm13-test.mapa `)
	
	const resources = new ResourcesD()
	await resources.load(`${ resourcesDir }basenfk/system/graph.d`)
	await resources.load(`${ resourcesDir }basenfk/system/graph2.d`)	
	
	const playerModel = new PlayerModel()
	await playerModel.load(`${ resourcesDir }basenfk/models/doom/dark.nmdl`)

	const player = new Player(playerModel)
	
	globalThis.map = map
	globalThis.resources = resources
	globalThis.playerModel = playerModel
	globalThis.player = player
	
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
	
	window.addEventListener('keydown', event => 
		player.addCtrlState( keyMap[ event.which ] | 0 ) )
	
	window.addEventListener('keyup', event => 
		player.delCtrlState( (keyMap[ event.which ] | 0) ) )
	//////////////////
}

window.addEventListener('load', main)

