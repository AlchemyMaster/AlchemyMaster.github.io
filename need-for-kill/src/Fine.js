
import { Item } from './Item.js'
import { playSound } from './SoundMgr.js'
import { setTimeout } from './Render.js'
import { getCacheResource, getResource } from './ResourceMgr.js'
import { SpriteGrid } from './Classes/SpriteGrid.js'
import { SpriteGridAnim } from './Classes/SpriteGridAnim.js'

const FineInfoList = [
	{
		id: 23,
		resourceName  : 'fine_regen',
		unRespawnMusic: '',
		onUseMusic    : 'basenfk/sound/regeneration.wav',
		respawnTime   : 120e3,
	},
	{
		id: 24,
		resourceName  : 'fine_battle',
		unRespawnMusic: '',
		onUseMusic    : null,
		respawnTime   : 120e3,
	},
	{
		id: 25,
		resourceName  : 'fine_haste',
		unRespawnMusic: '',
		onUseMusic    : 'basenfk/sound/haste.wav',
		respawnTime   : 120e3,
	},
	{
		id: 26,
		resourceName  : 'fine_quad',
		unRespawnMusic: '',
		onUseMusic    : 'basenfk/sound/quaddamage.wav',
		respawnTime   : 120e3,
	},
	{
		id: 27,
		resourceName  : 'fine_fly',
		unRespawnMusic: '',
		onUseMusic    : 'basenfk/sound/flight.wav',
		respawnTime   : 120e3,
	},
	{
		id: 28,
		resourceName  : 'fine_invis',
		unRespawnMusic: '',
		onUseMusic    : 'basenfk/sound/invisibility.wav',
		respawnTime   : 120e3,
	},
]
const FineInfoListByBrickIndexMap = Object.fromEntries(FineInfoList.map(v => [v.id, v]))

export class Fine extends Item {
	sgaFineMap = getCacheResource( 'Fine_g0932lknd', () => Object.fromEntries(FineInfoList
		.map(v => [v.id, new SpriteGridAnim(
			new SpriteGrid(getResource(v.resourceName).cnv, 37, 32, 20, 6),
			12
		)]) ) )

	fineInfo = null
	
	constructor(cx, y, brickIndex) {
		super(cx, y - 2, 20, 20, brickIndex)
		
		this.fineInfo = FineInfoListByBrickIndexMap[ this.brickIndex ]
	}
	
	draw() {
		this.sgaFineMap[ this.brickIndex ].drawCX(this.pos[0], this.pos[1] - 4)
	}

	intersection(gameObject) {
		if ( this.fineInfo.onUseMusic )
			playSound(this.fineInfo.onUseMusic)
		
		this.release()
		
		setTimeout(() => {
			new Fine(this.pos[0], this.pos[1], this.brickIndex)
		}, this.fineInfo.respawnTime)
	}
}



