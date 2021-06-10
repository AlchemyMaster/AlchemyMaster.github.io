
import { Item } from './Item.js'
import { playSound } from './SoundMgr.js'
import { setTimeout } from './Render.js'
import { getCacheResource, getResource } from './ResourceMgr.js'
import { SpriteGrid } from './Classes/SpriteGrid.js'
import { SpriteGridAnim } from './Classes/SpriteGridAnim.js'

const HealthInfoList = [
	{
		id: 19,
		onUseMusic: 'basenfk/sound/health5.wav',
		respawnTime: 20e3,
	},
	{
		id: 20,
		onUseMusic: 'basenfk/sound/health25.wav',
		respawnTime: 20e3,
	},
	{
		id: 21,
		onUseMusic: 'basenfk/sound/health50.wav',
		respawnTime: 30e3,
	},
]
const HealthInfoListByBrickIndexMap = Object.fromEntries(HealthInfoList.map(v => [v.id, v]))

export class Health extends Item {
	sg = getCacheResource( 'Health_ssdf09we', () => new SpriteGrid(getResource('item').cnv, 32, 16) )

	constructor(cx, y, brickIndex) {
		super(cx, y, 18, 20, brickIndex)
	}
	
	draw() {
		this.sg.drawCX(this.brickIndex, this.pos[0], this.pos[1] + 4)
	}

	intersection(gameObject) {
		const healthInfo = HealthInfoListByBrickIndexMap[ this.brickIndex ]
		if ( healthInfo.onUseMusic )
			playSound(healthInfo.onUseMusic)
		
		this.release()
		
		setTimeout(() => new Health(this.pos[0], this.pos[1], this.brickIndex), healthInfo.respawnTime)
	}	
}

export class HealthMega extends Item {
	sga = getCacheResource( 'HealthMega_sf30rb', () => new SpriteGridAnim( new SpriteGrid(getResource('fine_mega').cnv, 32, 32, 15), 12 ) )
	
	constructor(cx, y, brickIndex) {
		super(cx, y, 16, 16, brickIndex)
	}
	
	draw() {
		this.sga.drawEx(ctx, this.pos[0] - 8, this.pos[1], 16, 16)
	}
	
	intersection(gameObject) {
		playSound('basenfk/sound/health100.wav')		
		this.release()
		setTimeout(() => new HealthMega(this.pos[0], this.pos[1], this.brickIndex), 60e3)
	}	
}
