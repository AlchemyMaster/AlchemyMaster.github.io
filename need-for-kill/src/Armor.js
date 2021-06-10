
import { Item } from './Item.js'
import { playSound } from './SoundMgr.js'
import { setTimeout } from './Render.js'
import { getCacheResource, getResource } from './ResourceMgr.js'
import { SpriteGrid } from './Classes/SpriteGrid.js'
import { SpriteGridAnim } from './Classes/SpriteGridAnim.js'

export class Armor extends Item {
	sga = getCacheResource( 'Armor_sdf0329kid', () => {
		const sga = new SpriteGrid(getResource('armors').cnv, 32, 16, 40)
		return [ new SpriteGridAnim(sga.slice(0 , 20), 12), new SpriteGridAnim(sga.slice(20, 40), 12) ]
	})

	constructor(cx, y, brickIndex) {
		super(cx, y, 18, 20, brickIndex)
	}
	
	draw() {
		this.sga[ this.brickIndex - 17 ].drawCX(this.pos[0], this.pos[1] + 4)
	}

	intersection(gameObject) {
		playSound('basenfk/sound/armor.wav')
		this.release()

		setTimeout(() => {
			new Armor(this.pos[0], this.pos[1], this.brickIndex)
		}, 30e3)
	}
	
}

export class Armor5 extends Item {
	sg = getCacheResource( 'Armor5_df23htt', () => new SpriteGrid(getResource('item').cnv, 32, 16) )

	constructor(cx, y, brickIndex) {
		super(cx, y, 18, 10, brickIndex)
	}
	
	draw() {
		this.sg.drawCX(this.brickIndex, this.pos[0], this.pos[1])
	}

	intersection(gameObject) {
		playSound('basenfk/sound/ammopkup.wav')
		this.release()

		setTimeout(() => {
			new Armor5(this.pos[0], this.pos[1], this.brickIndex)
		}, 20e3)
	}
}

