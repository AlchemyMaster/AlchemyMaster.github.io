
import { RectTexture } from './Rect.js'

export class SpriteGrid {
	frames = []

	constructor(texture, itemWidth, itemHeight, maxFrames = 1e9, maxCellWidthCount = 1e9) {
		for(let y = 0; y < texture.height; y += itemHeight) {
			for(let x = 0; x < texture.width; x += itemWidth) {
				if ( x / itemWidth >= maxCellWidthCount )
					break
				this.frames.push( new RectTexture(texture, x, y, itemWidth, itemHeight) )
			}
		}
		
		this.frames = this.frames.slice(0, maxFrames)
	}
	
	_getXY(index) {
		return this.frames[ index % this.frames.length ]
	}

	draw(ctx, dx, dy, index) {
		const frame = this.frames[ index % this.frames.length ]
		ctx.drawImage(
			frame.texture,
			frame.x, frame.y, frame.width, frame.height,
			dx, dy, frame.width, frame.height
		)
	}
	drawEx(ctx, index, dx, dy, dw, dh) {
		const frame = this.frames[ index % this.frames.length ]
		ctx.drawImage(
			frame.texture,
			frame.x, frame.y, frame.width, frame.height,
			dx, dy, dw, dh
		)
	}
}
