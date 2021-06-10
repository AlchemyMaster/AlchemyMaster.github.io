
import { Item } from './Item.js'
import { playSound } from './SoundMgr.js'
import { setTimeout } from './Render.js'
import { getCacheResource, getResource } from './ResourceMgr.js'
import { SpriteGrid } from './Classes/SpriteGrid.js'

export class Ammo extends Item {
	sg = getCacheResource( 'Ammo_s93jbwveoc', () => new SpriteGrid(getResource('item').cnv, 32, 16) )

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
			new Ammo(this.pos[0], this.pos[1], this.brickIndex)
		}, 20e3)
	}
	
}