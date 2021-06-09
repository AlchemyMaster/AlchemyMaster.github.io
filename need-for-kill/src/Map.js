
import { decompress } from './lib/bzip/index.js'
import { fetchUint8Array, fetchText, getDirname, loadImageEx } from './Utils/Utils.js'
import { MemoryRW } from './Classes/MemoryRW.js'

export async function parseMap(buf) {
	const mrw = new MemoryRW(buf.buffer)
	
	const header = {
		id       : mrw.readCString(4),
		version  : mrw.readU8(),
		mapName  : mrw.readDelphiString(70),
		author   : mrw.readDelphiString(70),
		mapSizeX : mrw.readU8(),
		mapSizeY : mrw.readU8(),
		bg       : mrw.readU8(),
		gameType : mrw.readU8(),
		numObj   : mrw.readU8(),
		numLights: mrw.readU16(),
	}
	
	const bbb = Array(header.mapSizeY)
		.fill(0)
		.map(v => Array(header.mapSizeX)
			.fill(0)
			.map(v => mrw.readU8()) )


	const ddd = Array(header.numObj)
		.fill(0)
		.map(v => ({
			active    : mrw.readU8(),
			_pad      : mrw.readU8(),
			
			x         : mrw.readU16(),
			y         : mrw.readU16(),
			length    : mrw.readU16(),
			dir       : mrw.readU16(),
			wait      : mrw.readU16(),
			
			targetName: mrw.readU16(),
			target    : mrw.readU16(),
			orient    : mrw.readU16(),
			nowAnim   : mrw.readU16(),
			special   : mrw.readU16(),
			
			objType   : mrw.readU8(),
			_pad2     : mrw.readU8(),
		}))
	
	const readMapEntry = () => {
		return {
			entryType: mrw.readDelphiString(3),
			dataSize : mrw.readU32(),
			reserved1: mrw.readU8(),
			reserved2: mrw.readU16(),
			reserved3: mrw.readI32(),
			reserved4: mrw.readI32(),
			reserved5: mrw.readU32(),
			reserved6: mrw.readU8(),
		}
	}

	let pal = null
	const locations = []
	while( mrw.offset < mrw.dataView.byteLength ) {
		const mapEntry = readMapEntry()
		switch( mapEntry.entryType ) {
			case 'pal':
				pal = {
					info: mapEntry,
					data: Array(mapEntry.dataSize)
						.fill(0)
						.map(v => mrw.readU8())
				}
				break
				
			case 'loc':
				if ( mrw.offset < mrw.dataView.byteLength ) {
					locations.push({
						enabled: mrw.readU8(),
						x      : mrw.readU8(),
						y      : mrw.readU8(),
						text   : mrw.readDelphiString(64),
					})
				}
				break
		}
	}

	if ( pal ) {
		const palData = decompress( new Uint8Array(pal.data) )
		const blob = new Blob([ palData ], { type: 'image/bmp' })
		pal.img = await loadImageEx(URL.createObjectURL(blob))
	}
	
	return {
		header,
		bbb,
		ddd,
		locations,
		pal,
	}
}

export class Map {
	header = null
	bbb = null
	ddd = null
	locations = null
	pal = null
	customBg = null
	
	async load(path) {
		const map = await parseMap( await fetchUint8Array(path) )
		this.header = map.header
		this.bbb = map.bbb
		this.ddd = map.ddd
		this.locations = map.locations
		this.pal = map.pal
		
		try {
			this.customBg = {
				cnv: await loadImageEx(getDirname(getDirname(path)) + '/custom/bg_' + this.header.bg + '.jpg')
			}
		} catch {
		}
	}
}
