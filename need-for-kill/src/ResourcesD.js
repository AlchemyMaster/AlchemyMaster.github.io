
import { decompress } from './lib/bzip/index.js'
import { fetchUint8Array, fetchText, getDirname, loadImageEx, createCanvasCtx } from './Utils/Utils.js'
import { MemoryRW } from './Classes/MemoryRW.js'
import { Inflate } from './lib/zlibjs/inflate.js'

export async function parseFileD(buf) {
	const mrw = new MemoryRW(buf.buffer)
	
	const header = {
		sig        : mrw.readCString(4),
		version    : mrw.readFloat(),
		coVersion  : mrw.readFloat(),
		recordCount: mrw.readI32(),
		tablePos   : mrw.readI32(),
		reserved   : mrw.readCString(44),
	}
	
	const readRecord = () => {
		return {
			key        : mrw.readDelphiString(31),
			format     : mrw.readI32(),
			filePos    : mrw.readI32(),
			crc32      : mrw.readU32(),
			size       : mrw.readI32(),
			origSize   : mrw.readI32(),
			reserved   : mrw.readCString(12),
		}
	}
		
	mrw.offset = header.tablePos
	
	const records = Array(header.recordCount)
		.fill(0)
		.map(readRecord)	
	
	const map = new Map()
	records.map(v => {
		mrw.offset = v.filePos
		const record = readRecord()

		let data = new Uint8Array( Array(record.size)
			.fill(0)
			.map(v => mrw.readU8()) )
		
		const inflate = new Inflate(data)
		const newData = inflate.decompress()
		
		const imgMrw = new MemoryRW(newData.buffer)
		const imgHeader = {
			sig   : imgMrw.readCString(4),
			width : imgMrw.readI32(),
			height: imgMrw.readI32(),
		}
		imgMrw.offset = 24
		
		const pixels = Array(imgHeader.height)
			.fill(0)
			.map(v => Array(imgHeader.width)
				.fill(0)
				.map(v => [imgMrw.readU8(), imgMrw.readU8(), imgMrw.readU8(), imgMrw.readU8()]) )
		
		const { cnv, ctx } = createCanvasCtx(imgHeader.width, imgHeader.height)
		const outData = ctx.getImageData(0, 0, imgHeader.width, imgHeader.height)
		for(let y = 0; y < imgHeader.height; y++) {
			const rowOffset = y * imgHeader.width * 4
			for(let x = 0; x < imgHeader.width; x++) {
				const pixelOffset = rowOffset + x * 4
				const src = pixels[y][x]
				outData.data[ pixelOffset + 0 ] = src[2]
				outData.data[ pixelOffset + 1 ] = src[1]
				outData.data[ pixelOffset + 2 ] = src[0]
				outData.data[ pixelOffset + 3 ] = src[3]
			}
		}
		ctx.putImageData(outData, 0, 0)
		
		map.set(record.key.toLowerCase(), { 
			cnv, 
			ctx,
			...imgHeader,
		})
	})
	
	return map
}

export class ResourcesD extends Map {
	async load(path) {
		[...await parseFileD( await fetchUint8Array(path) )]
			.map(([key, val]) => {
				if ( this.has(key) )
					console.log(`Resource '${ key }' in d file '${ path }' already exists`)

				this.set(key, val)
			})
	}
}