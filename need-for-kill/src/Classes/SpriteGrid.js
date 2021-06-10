
import { RectTexture } from './Rect.js'
import { Sprite } from './Sprite.js'
import { drawSprite } from '../Render.js'

export class SpriteGrid {
	frames = []

	constructor(texture, itemWidth, itemHeight, maxFrames = 1e9, maxCellWidthCount = 1e9) {
		this.texture = texture

		for(let y = 0; y < texture.height; y += itemHeight) {
			for(let x = 0; x < texture.width; x += itemWidth) {
				if ( x / itemWidth >= maxCellWidthCount )
					break
				this.frames.push( new Sprite(texture, x, y, itemWidth, itemHeight) )
			}
		}
		
		this.frames = this.frames.slice(0, maxFrames)
	}

	draw(ctx, index, dx, dy) {
		const sprite = this.frames[ index % this.frames.length ]
		
		drawSprite(sprite, dx, dy, sprite.width, sprite.height)
		return
		ctx.drawImage(
			frame.texture,
			frame.x, frame.y, frame.width, frame.height,
			dx, dy, frame.width, frame.height
		)
	}
	drawEx(ctx, index, dx, dy, dw, dh) {
		const sprite = this.frames[ index % this.frames.length ]
		
		drawSprite(sprite, dx, dy, dw, dh)
		return
		ctx.drawImage(
			frame.texture,
			frame.x, frame.y, frame.width, frame.height,
			dx, dy, dw, dh
		)
	}
	
	slice(iStart, iEnd) {
		const clone = new SpriteGrid(this.texture, 1e9, 1e9, 0, 0)
		clone.frames = this.frames.slice(iStart, iEnd)
		return clone
	}
}
