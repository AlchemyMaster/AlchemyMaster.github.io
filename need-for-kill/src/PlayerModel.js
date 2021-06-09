
import { fetchUint8Array, fetchText, getDirname, loadImageEx, createCanvasCtx } from './Utils/Utils.js'
import { parse } from './lib/ini/index.js'
import { RectTexture } from './Classes/Rect.js'

export class PlayerModel {
	keysFull = ['walk', 'die', 'crouch', 'walkPower', 'crouchPower',]
	async load(path) {
		const text = await fetchText(path)
		const iniData = parse( text )
		
		this.dieTexPath = getDirname(path) + '/' + iniData.main.diebmp
		this.walkTexPath = getDirname(path) + '/' + iniData.main.walkbmp
		this.crouchTexPath = getDirname(path) + '/' + iniData.main.crouchbmp
		this.walkPowerTexPath = getDirname(path) + '/' + iniData.main.walkpowerbmp
		this.crouchPowerTexPath = getDirname(path) + '/' + iniData.main.crouchpowerupbmp

        this.version = +iniData.main.version
        this.name = iniData.main.name 
		
		this.walk = {
			sizeX      : +iniData.main.modelsizex,
			startFrame : +iniData.main.walkstartframe,
			frames     : +iniData.main.walkframes,
			refreshTime: +iniData.main.framerefreshtime,
			texture    : await loadImageEx(this.walkTexPath),
		}
		
		const correctProp = prop => {
			const correctMap = {
				crouchpowerbmp: 'crouchpowerupbmp',
				walksizex: 'modelsizex',
				walkframerefreshtime: 'framerefreshtime',
			}
			return correctMap[prop] ?? prop
		}
		
		const keys = ['walk', 'die', 'crouch']
		const props = ['sizeX', 'sizeY', 'startFrame', 'frames', 'frameRefreshTime']
		for(const key of keys) {
			this[key] = {}
			for(const prop of props)
				this[key][prop] = +iniData.main[ correctProp( (key + prop).toLowerCase() ) ]
			
			const texFileName = iniData.main[ correctProp( (key + 'bmp').toLowerCase() ) ]
			const texPath = getDirname(path) + '/' + texFileName
			this[key].texture = await loadImageEx(texPath)
		}
		
		keys.map(key => {
			const obj = this[key]
			props.map(prop => {
				if ( isNaN(obj[prop]) )
					obj[prop] = this.walk[prop]
				
				
				if ( isNaN(this[key].sizeY) )
					obj.sizeY = obj.texture.height
				if ( isNaN(obj.startFrame) )
					obj.startFrame = 0
			})
		})
		

		this.walkPower = { 
			...this.walk,
			texture: await loadImageEx( getDirname(path) + '/' + iniData.main.walkpowerbmp ),
		}
		this.crouchPower = { 
			...this.crouch,
			texture: await loadImageEx( getDirname(path) + '/' + iniData.main.crouchpowerupbmp ),
		}
		
		for(const key of this.keysFull) {
			const obj = this[key]
			if ( isNaN(obj.sizeX) )
				obj.sizeX = obj.texture.width / obj.frames
			
			obj.framesList = this.makeFrames(obj.texture, obj.texture.width, obj.sizeX, obj.texture.height, false)
			
			obj.right = {
				frameRefreshTime: obj.frameRefreshTime,
				frames: this.makeFrames(obj.texture, obj.texture.width, obj.sizeX, obj.texture.height, false),
			}
			obj.left  = {
				frameRefreshTime: obj.frameRefreshTime,
				frames: this.makeFrames(this.rotateImage(obj.texture), obj.texture.width, obj.sizeX, obj.texture.height, true),
			}
		}
		
		//obj.idle = {}
		//obj.move = {}
		
		globalThis.playerModel = this
		
		this.prevFrameTime = Date.now()
		this.startAniTime = Date.now()
		
		this.rotateImages()
		
		this.ani = this.walk
	}

	makeFrames(texture, texWidth, itemWidth, itemHeight, fromLeftToRight = false) {
		const frames = []
		for(let x = 0; x < texWidth; x += itemWidth) {
			frames.push(new RectTexture(texture, x, 0, itemWidth, itemHeight))
		}
		
		if ( fromLeftToRight )
			frames.map(f => f.x = texWidth - f.x - itemWidth)
		
		return frames
	}

	rotateImage(img) {
		const w = img.width
		const h = img.height
		
		const { cnv, ctx } = createCanvasCtx(w, h)
		ctx.drawImage(img, 0, 0)
		
		const srcData = ctx.getImageData(0, 0, w, h)
		const dstData = ctx.getImageData(0, 0, w, h)
		for(let y = 0; y < h; y++) {
			for(let x = 0; x < w; x++) {
				const srcOffset = y * w * 4 + x * 4
				const dstOffset = y * w * 4 + (w - x - 1) * 4
				
				dstData.data[ dstOffset + 0 ] = srcData.data[ srcOffset + 0 ]
				dstData.data[ dstOffset + 1 ] = srcData.data[ srcOffset + 1 ]
				dstData.data[ dstOffset + 2 ] = srcData.data[ srcOffset + 2 ]
				dstData.data[ dstOffset + 3 ] = srcData.data[ srcOffset + 3 ]
			}
		}

		ctx.putImageData(dstData, 0, 0)
		return cnv
	}
	rotateImages() {
		for(const key of this.keysFull) {
			const obj = this[key]
			obj.texture = this.rotateImage(obj.texture)
		}
	}
	
	draw(ctx) {
		return
		const now = Date.now()
		const frameTime = now - this.prevFrameTime
		this.prevFrameTime = now
		
		const aniTime = now - this.startAniTime

		const aniIndex = (aniTime / (this.ani.frameRefreshTime * 15)) | 0
		this.prevAniIndex = this.prevAniIndex ?? aniIndex
		
		if ( this.prevAniIndex !== aniIndex ) {
			this.prevAniIndex = aniIndex
		//	console.log(aniIndex  % this.walkFramesList.length )
		}
		
		//const x = (aniIndex * this.modelSizeX) % this.walkTex.width
		const x = this.ani.framesList[ aniIndex % this.ani.framesList.length ]
		
		ctx.drawImage(
			this.ani.texture, 
			x, 0, this.ani.sizeX, this.ani.texture.height, 
			100, 100, this.ani.sizeX, this.ani.sizeY
		)
		//ctx.drawImage(this.walkTex, 100, 100, 0, 0, this.modelSizeX, this.walkTex.height)
	}
}
