
export class Rect {
	x = 0
	y = 0
	width = 0
	height = 0
	
	constructor(x = 0, y = 0, width = 0, height = 0) {
		this.x      = x
		this.y      = y
		this.width  = width
		this.height = height
	}
}

export class RectTexture extends Rect {
	texture = null

	constructor(texture, x, y, w = texture.width, h = texture.height) {
		super(x, y, w, h)
		this.texture = texture
	}
}