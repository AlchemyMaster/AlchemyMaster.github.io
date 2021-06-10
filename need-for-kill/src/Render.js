/**
сис. координат
	x - слева на право
	y - снизу в верх
*/

let cnv = null
let ctx = null
let width  = 0
let height = 0

export const setContext = (_cnv, _ctx) => {
	cnv = _cnv
	ctx = _ctx
	
	width  = cnv.width
	height = cnv.height
}

export const drawSprite = (sprite, dx, dy, dw = sprite.width, dh = sprite.height) => {
	ctx.drawImage(
		sprite.texture,
		sprite.x, sprite.y, sprite.width, sprite.height,
		dx, height - dy - dh, dw, dh
	)
}

export const drawSpriteCX = (sprite, cx, dy, dw = sprite.width, dh = sprite.height) => {
	drawSprite(sprite, cx - dw/2, dy, dw, dh)
}

export const drawLine = (sx, sy, dx, dy) => {
	ctx.beginPath()
	ctx.moveTo(sx, height - sy)
	ctx.lineTo(dx, height - dy)
    ctx.stroke()
}

export const devDrawRect = (x, y, w, h) => {
	ctx.fillRect(x, height - y - h, w, h)
}

let prevFrameTime = Date.now() - 20
let frameTime = Date.now()
let frameDeltaTime = 20
let frameDeltaTimeSec = 0.02

export const getFrameTime = () => frameTime
export const getFrameDeltaTime = () => frameDeltaTime
export const getFrameDeltaTimeSec = () => frameDeltaTimeSec
export const updateFrameTime = () => {
	prevFrameTime = frameTime
	frameTime = Date.now() 
	frameDeltaTime = frameTime - prevFrameTime
	frameDeltaTimeSec = frameDeltaTime / 1e3
}

globalThis.devDrawRect = devDrawRect
