
import { GameObject } from './GameObject.js'
import { drawSpriteCX, getFrameDeltaTimeSec } from './Render.js'
import * as vec2 from './lib/glmatrix/vec2.js'
import { IDItem } from './ObjectID.js'
import { BBox } from './Classes/BBox.js'
import { playSound } from './SoundMgr.js'

export class Item extends GameObject {
	brickIndex = 0
	sgStatic = null

	constructor(x, y, w, h, brickIndex) {
		super(IDItem, [x, y], new BBox(x - w/2, y, x + w/2, y + h))

		this.brickIndex = brickIndex
	}

	intersection(gameObject) {
		this.release()
	}
}
