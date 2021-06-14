
import { GameObject } from './GameObject.js'
import { drawSpriteCX, getFrameDeltaTimeSec, setTimeout } from './Render.js'
import * as vec2 from './lib/glmatrix/vec2.js'
import { IDBrick } from './ObjectID.js'
import { BBox } from './Classes/BBox.js'

export const BRICK_WIDTH  = 32
export const BRICK_HEIGHT = 16

export class Brick extends GameObject {
	brickIndex = 0
	sgStatic = null

	constructor(x, y, brickIndex, sgStatic) {
		super(IDBrick, [x, y], new BBox(x - BRICK_WIDTH/2, y, x + BRICK_WIDTH/2, y + BRICK_HEIGHT))

		this.brickIndex = brickIndex
		this.sgStatic = sgStatic
	}

	draw() {
		this.sgStatic.draw(ctx, this.brickIndex - 54, this.pos[0] - BRICK_WIDTH/2, this.pos[1])
	}
	
	destroyAndCreate(respawnTime) {
		this.release()

		setTimeout(() => {
			new Brick(this.pos[0], this.pos[1], this.brickIndex, this.sgStatic)
		}, respawnTime)
	}
}
