
import { GameObject } from './GameObject.js'
import { drawSpriteCX, getFrameDeltaTimeSec, setTimeout, getContext } from './Render.js'
import * as vec2 from './lib/glmatrix/vec2.js'
import { IDBrick, IDBullet, IDPlayer, IDItem, IDParticle } from './ObjectID.js'
import { BBox } from './Classes/BBox.js'
import { playSound } from './SoundMgr.js'
import { getCollisions, getCollisionsBBox } from './GameObjectMgr.js'
import { getCacheResource, getResource } from './ResourceMgr.js'
import { SpriteGrid } from './Classes/SpriteGrid.js'
import { SpriteGridAnim } from './Classes/SpriteGridAnim.js'
import { ActionLoop } from './Classes/ActionLoop.js'

export class Particle extends GameObject {
	sg = getCacheResource( 'Bullet_9g4o3knds', () => {
		const sgBulletMrk = new SpriteGrid(getResource('bullet_mrk').cnv, 16, 16)
		const sg8x8 = new SpriteGrid(getResource('8x8').cnv, 8, 8, 6)
		const sg16x16 = new SpriteGrid(getResource('16x16').cnv, 16, 16)
		 
		return { sgBulletMrk, sg8x8, sg16x16 }
	})
	
	
	constructor(x, y) {
		super(IDParticle, [x, y], new BBox())

		setTimeout(() => this.release(), 5e3)
	}
	
	startAni = 0
	al = new ActionLoop()
	draw() {
		this.al.update(10, () => this.startAni++)
		if ( this.startAni >= 3 )
			return this.release()
		
		//this.sg.sg16x16.drawEx(0, this.startAni, this.pos[0] - 4, this.pos[1] - 4, 8, 8)
		//this.sg.sg16x16.drawEx(0, this.startAni, this.pos[0] - 8, this.pos[1] - 8, 16, 16)
		
		const sprite = this.sg.sg16x16.frames[ this.startAni ]
		
		const w = 10, h = 10
		
		const { cnv, ctx } = getContext()
		ctx.save()		
		
		ctx.translate(this.pos[0], cnv.height - this.pos[1] - h)
		ctx.translate(-w/2, +h/2)
		
		const [rx, ry] = [w/2, h/2]
		ctx.translate(+rx, +ry)
		ctx.rotate(Math.random() * Math.PI)
		ctx.translate(-rx, -ry)

		ctx.drawImage(
			sprite.texture, 
			sprite.x, sprite.y, sprite.width, sprite.height,			
			0,0, w, h
		)
		
		ctx.restore()

		if ( this.ctrlState & PLAYER_CTRL_STATE.Attack ) {
			this.weaponAttackLoop.update(this.weaponNumAttackPerSec, () => {
				this.weaponAttack()
			})
		}
	}
}