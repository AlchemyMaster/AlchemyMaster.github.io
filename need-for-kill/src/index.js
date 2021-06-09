
import { Map } from './Map.js'
import { ResourcesD } from './ResourcesD.js'
import { Player, PLAYER_STATE } from './Player.js'
import { PlayerModel } from './PlayerModel.js'
import { fetchUint8Array, fetchText, getDirname, loadImageEx, createCanvasCtx } from './Utils/Utils.js'
import { SpriteGrid } from './Classes/SpriteGrid.js'
import { SpriteGridAnim } from './Classes/SpriteGridAnim.js'

function drawMap(map, res, player) {	
	const { cnv, ctx } = createCanvasCtx(map.header.mapSizeX * 32, map.header.mapSizeY * 16)	
	const canvas = cnv
	document.body.appendChild(cnv)
	globalThis.ctx = ctx
	
	const palSpriteGrid = new SpriteGrid(map.pal.img, 32, 16)
	
	const aromors = new SpriteGrid(res.get('armors').cnv, 32, 16)
	const items   = new SpriteGrid(res.get('item').cnv, 32, 16)
	
	const bricksFineMap = Object.fromEntries(
		[ [23, 'fine_regen'], [26, 'fine_quad'], [28, 'fine_invis'], [24, 'fine_battle'], [25, 'fine_haste'], [27, 'fine_fly'], ]
	)
	
	const bricksStatic = []
	const bricksItem = []

	map.bbb.map((row, y) => {
		row.map((brickIndex, x) => {
			if ( !brickIndex )
				return
			
			if ( brickIndex >= 54 )
				return bricksStatic.push({ x, y, brickIndex })
			
			if ( (brickIndex >= 1 && brickIndex <= 16) || (brickIndex >= 19 && brickIndex <= 21) ) {
				return bricksItem.push({ x, y, 
					draw: () => items.draw(ctx, x*32, y*16, brickIndex) 
				})
			}
			
			if ( bricksFineMap[brickIndex] ) {
				const brickRes = res.get(bricksFineMap[brickIndex])
				const spriteGridAnim = new SpriteGridAnim(
					new SpriteGrid(brickRes.cnv, 37, 32, 20, 6),
					12
				)
				bricksItem.push({
					x, y, draw: () => spriteGridAnim.draw(ctx, x*32, y*16 - 16)
				})
				return
			}
			
			if ( brickIndex == 22 ) {
				const brickRes = res.get('fine_mega')
				const spriteGridAnim = new SpriteGridAnim(
					new SpriteGrid(brickRes.cnv, 32, 32, 15),
					12
				)
				bricksItem.push({
					x, y, draw: () => spriteGridAnim.drawEx(ctx, x*32 + 8, y*16 - 16 + 8, 16, 16)
				})
				return
			}
			
			if ( brickIndex == 17 ) {
				const brickRes = res.get('armors')
				const spriteGridAnim = new SpriteGridAnim(
					new SpriteGrid(brickRes.cnv, 32, 16, 20),
					12
				)
				bricksItem.push({
					x, y, draw: () => spriteGridAnim.draw(ctx, x*32, y*16 - 8)
				})
				return
				
			}
			
			bricksItem.push({ draw: () => ctx.fillText(brickIndex, x*32 + 16, y*16 + 8) })
		})			
	})
	
	const drawBackground = () => {
		const bg = map.customBg ?? res.get('bg_' + map.header.bg)
		for(let y = 0; y < canvas.width; y += bg.cnv.width)
			for(let x = 0; x < canvas.width; x += bg.cnv.width)
				ctx.drawImage(bg.cnv, x, y)
	}
	
	const drawBricksStatic = () => 
		bricksStatic.map(brick => 
			palSpriteGrid.draw(ctx, brick.x*32, brick.y*16, brick.brickIndex - 54) )
	
	const drawBricksItem = () =>
		bricksItem.map(brick => brick.draw())

	const draw = () => {
		requestAnimationFrame(draw)
		
		drawBackground()		
		drawBricksStatic()
		drawBricksItem()
		player.draw(ctx)
	}
	draw()
}

async function main() {
	const map = new Map()
	await map.load('./basenfk/maps/dm13-test.mapa')
	
	const resources = new ResourcesD()
	await resources.load('./basenfk/system/graph.d')
	await resources.load('./basenfk/system/graph2.d')	
	
	const playerModel = new PlayerModel()
	await playerModel.load('./basenfk/models/doom/dark.nmdl')

	const player = new Player(playerModel)
	
	globalThis.map = map
	globalThis.resources = resources
	globalThis.playerModel = playerModel
	globalThis.player = player
	
	drawMap(map, resources, player)
	
	//////////////////
	const keyMap = {
		65: PLAYER_STATE.LookLeft  | PLAYER_STATE.Move,
		68: PLAYER_STATE.LookRight | PLAYER_STATE.Move,
		83: PLAYER_STATE.Crouch,
		87: 0,
	}
	
	window.addEventListener('keydown', event => 
		player.addState( keyMap[ event.which ] | 0 ) )
	
	window.addEventListener('keyup', event => 
		player.delState( (keyMap[ event.which ] | 0) & (~( PLAYER_STATE.LookLeft | PLAYER_STATE.LookRight ) ) ) )
	//////////////////
}

window.addEventListener('load', main)

