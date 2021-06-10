
const specBBox2Ints = (bbox1, bbox2) => {
	return bbox1.min[0] <= bbox2.min[0] && 
		bbox1.max[0] >= bbox2.max[0] &&
		bbox1.min[1] >= bbox2.min[1] && 
		bbox1.max[1] <= bbox2.max[1]
}

export class BBox {
	min = [0, 0]
	max = [0, 0]
	
	constructor(minX = 0, minY = 0, maxX = 0, maxY = 0) {
		this.min = [minX, minY]
		this.max = [maxX, maxY]
	}
	
	isPointInBBox(point) {
		const x = point[0]
		const y = point[1]
		
		const min = this.min
		const max = this.max
		
		return x >= min[0] && x <= max[0] && y >= min[1] && y <= max[1]
	}
	isBBoxInBBox(bbox) {
		if ( this.getPoints().some(p => bbox.isPointInBBox(p)) )
			return true
		
		if ( bbox.getPoints().some(p => this.isPointInBBox(p)) )
			return true
		
		return specBBox2Ints(this, bbox) || specBBox2Ints(bbox, this)
	}
	
	getPoints() {
		const min = this.min
		const max = this.max
		
		return [
			[min[0], min[1]],
			[min[0], max[1]],
			[max[0], min[1]],
			[max[0], max[1]],
		]	
	}
}