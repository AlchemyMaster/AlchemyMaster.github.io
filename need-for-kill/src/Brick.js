
import { GameObject } from './GameObject.js'
import { drawSpriteCX, getFrameDeltaTimeSec } from './Render.js'
import * as vec2 from './lib/glmatrix/vec2.js'
import { IDBrick } from './ObjectID.js'
import { BBox } from './Classes/BBox.js'

export class Brick extends GameObject {
	brickIndex = 0
	sgStatic = null

	constructor(x, y, brickIndex, sgStatic) {
		super(IDBrick, [x, y], new BBox(x, y, x + 32, y + 16))

		this.brickIndex = brickIndex
		this.sgStatic = sgStatic
	}

	draw() {
		this.sgStatic.draw(ctx, this.brickIndex - 54, this.pos[0], this.pos[1])
	}
}
