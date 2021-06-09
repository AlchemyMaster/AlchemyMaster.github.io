
import { getUint8ArrayView } from '../Utils/Utils.js'

class MemReaderBase {
	constructor(arrayBuffer, offset = 0) {
		const u8array = getUint8ArrayView(arrayBuffer)
		this.offset   = 0
		this.dataView = new DataView(u8array.buffer, u8array.byteOffset, u8array.byteLength)
	}
}
function MakeMemReaderBase() {
	const c = class extends MemReaderBase {}
	
	for(const bits of [8, 16, 32])
		for(const type of ['Int', 'Uint']) {
			c.prototype[ 'read' + type[0] + '' + bits ] = new Function(`
		const result = this.dataView.get${ type }${ bits }( this.offset, true )
		this.offset += ${ bits / 8 }
		return result
`)

			c.prototype[ 'write' + type[0] + '' + bits ] = new Function(['value'], `
		this.dataView.set${ type }${ bits }( this.offset, value, true )
		this.offset += ${ bits / 8 }
		return this
`)
		}
	
	return c
}
export class MemoryRW extends MakeMemReaderBase() {
	constructor(arrayBuffer, offset = 0) {
		super(arrayBuffer, offset)
	}
	
	readFloat() {
		const result = this.dataView.getFloat32( this.offset, true )
		this.offset += 4
		return result
	}
	
	readCString(len) {
		return Array(len)
			.fill(0)
			.map(v => this.readU8())
			.map(v => String.fromCharCode(v))
			.join('')
			.replace(/\x00[^]*$/, '')
	}
	readDelphiString(len) {
		const realLen = Math.min(len, this.readU8())
		return this.readCString(len).slice(0, realLen)
	}
}
