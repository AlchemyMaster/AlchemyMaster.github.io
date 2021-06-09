
import TgaLoader from '../lib/tgajs/index.js'

export const getUint8ArrayView = buffer => {
	const arrayBuffer = buffer.buffer ?? buffer
	const byteOffset  = buffer.byteOffset | 0
	const byteLength  = buffer.byteLength | 0
	return new Uint8Array(arrayBuffer, byteOffset, byteLength)
}

export const fetchUint8Array = async path => 
	new Uint8Array( await (await fetch(path)).arrayBuffer() )

export const fetchText = async path =>
	await (await fetch(path)).text()

export const getDirname = path =>
	path.replace(/[\\\/][^\\\/]*$/, '')

export const loadImage = path => new Promise((res, rej) => {
	const img = new Image()
	img.src = path
	img.onload = () => res(img)
	img.onerror = rej
})

export const loadImageTGA = path => new Promise((res, rej) => {
	const tga = new TgaLoader()
	tga.open(path, () => {
		res(tga.getCanvas())
	})
})

export const loadImageEx = path => {
	if ( path.toLowerCase().split('.').pop() === 'tga' )
		return loadImageTGA(path)
	
	return loadImage(path)
}
	
export const createCanvasCtx = (width, height) => {
	const cnv  = document.createElement('canvas')
	cnv.width  = width
	cnv.height = height
	cnv.style.width  = `${ width  }px`
	cnv.style.height = `${ height }px`
	const ctx = cnv.getContext('2d')
	return { cnv, ctx }
}

export const parcelToU8Arr = str => 
	str.split('').map(c => c.charCodeAt())

