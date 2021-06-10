
import { GameObject } from './GameObject.js'
import { drawSpriteCX, getFrameDeltaTimeSec } from './Render.js'
import * as vec2 from './lib/glmatrix/vec2.js'
import { IDItem } from './ObjectID.js'
import { BBox } from './Classes/BBox.js'

export class Item extends GameObject {
	brickIndex = 0
	sgStatic = null

	constructor(x, y, w, h, brickIndex, _draw) {
		super(IDItem, [x, y], new BBox(x, y, x + w, y + h))

		this.brickIndex = brickIndex
		this._draw = _draw
	}

	draw() {
		this._draw()
	}

	intersection(gameObject) {
		this.release()
	}
}
