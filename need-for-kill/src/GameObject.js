
import { BBox } from './Classes/BBox.js'

import { addGameObject, delGameObject } from './GameObjectMgr.js'
import { drawLine } from './Render.js'

export class GameObject {
	objectID = 0
	subObjectID = 0
	
	pos = [0, 0]
	bbox = new BBox()
	
	constructor(objectID = 0, pos, bbox) {
		this.objectID = objectID
		this.pos = pos
		this.bbox = bbox
		
		addGameObject(this)
	}

	update() {}
	draw() {}
	intersection(gameObject) {}
	
	drawBBox() {
		const { min, max } = this.bbox
		drawLine(min[0], min[1], min[0], max[1])
		drawLine(min[0], min[1], max[0], min[1])
		drawLine(max[0], max[1], min[0], max[1])
		drawLine(max[0], max[1], max[0], min[1])
	}
	
	release() {
		delGameObject(this)
	}
}

