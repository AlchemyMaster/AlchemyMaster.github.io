
import { RectTexture } from './Rect.js'
import { createCanvasCtx } from '../Utils/Utils.js'

export class Sprite extends RectTexture {
	
	toTexture(index) {
		const { cnv, ctx } = createCanvasCtx(this.width, this.height)
		ctx.drawImage(img, 0, 0)
	}
}