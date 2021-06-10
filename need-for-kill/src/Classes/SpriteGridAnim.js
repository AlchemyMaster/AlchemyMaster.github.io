
export class SpriteGridAnim {
	spriteGrid = null
	framesPerSec = 5

	constructor(spriteGrid, framesPerSec = 5) {
		this.spriteGrid = spriteGrid
		this.framesPerSec = framesPerSec
		this.startTime = Date.now()
	}
	
	draw(ctx, x, y) {
		const now = Date.now()
		
		const frame = ( ((now - this.startTime) / 1e3) * this.framesPerSec ) | 0
		
		this.spriteGrid.draw(ctx, frame, x, y)
	}
	drawEx(ctx, x, y, w, h) {
		const now = Date.now()
		
		const frame = ( ((now - this.startTime) / 1e3) * this.framesPerSec ) | 0
		
		this.spriteGrid.drawEx(ctx, frame, x, y, w, h)
	}
}