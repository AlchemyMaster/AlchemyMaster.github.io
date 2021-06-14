
import { GameObject } from './GameObject.js'
import { drawSpriteCX, getFrameDeltaTimeSec, setTimeout, getContext } from './Render.js'
import * as vec2 from './lib/glmatrix/vec2.js'
import { IDBrick, IDBullet, IDPlayer, IDItem } from './ObjectID.js'
import { BBox } from './Classes/BBox.js'
import { playSound } from './SoundMgr.js'
import { getCollisions, getCollisionsBBox } from './GameObjectMgr.js'
import { getCacheResource, getResource } from './ResourceMgr.js'
import { SpriteGrid } from './Classes/SpriteGrid.js'
import { SpriteGridAnim } from './Classes/SpriteGridAnim.js'
import { Particle } from './Particle.js'

export class Bullet extends GameObject {
	sg = getCacheResource( 'Bullet_9g4o3knds', () => {
		const sgBulletMrk = new SpriteGrid(getResource('bullet_mrk').cnv, 16, 16)
		const sg8x8 = new SpriteGrid(getResource('8x8').cnv, 8, 8, 6)
		const sg16x16 = new SpriteGrid(getResource('16x16').cnv, 16, 16)
		const sgaExplositon = new SpriteGridAnim( new SpriteGrid(getResource('explosion').cnv, 32, 32) )
		 
		return { sgBulletMrk, sg8x8, sg16x16, sgaExplositon }
	})
	
	sgStatic = null
	vec = [1, 0]
	
	constructor(sx, sy, angle) {
		super(IDBullet, [sx, sy], new BBox(sx - 2, sy - 2, sx + 2, sy + 2))
		
		this.angle = angle
		this.vec = [ Math.cos( angle ), Math.sin( angle ) ]
		
		setTimeout(() => this.release(), 3e3)
	}

	calcBBox(bbox, pos) {
		bbox.min[0] = pos[0] - 2
		bbox.min[1] = pos[1] - 2
		bbox.max[0] = pos[0] + 2
		bbox.max[1] = pos[1] + 2		
	}

	getBricksCollisionsBBox(bbox) {
		return getCollisionsBBox(bbox)
			.filter(v => v.objectID === IDBrick)		
	}
	isHasCollisionsBBox(bbox) {
		return getCollisionsBBox(bbox)
			.filter(v => v.objectID === IDBrick)
			.length !== 0		
	}

	update() {
		const addPos = vec2.scale([], this.vec, getFrameDeltaTimeSec() * 1000)
		const newPos = vec2.add([], this.pos, addPos)
		
		const set = new Set([IDPlayer, IDBullet])
		const coll = getCollisions(this.pos, newPos, go => !set.has(go.objectID) )
		
		if ( coll ) {
			const go = coll.gameObject
			if ( go.objectID === IDBrick ) {
				go.hp -= 10
				if ( go.hp <= 0 )
					go.destroyAndCreate(5000)	
				
				new Particle(coll.pos[0], coll.pos[1])
				return this.destroy()
			}
			
			if ( go.objectID === IDItem ) {
				go.hp -= 50
				if ( go.hp <= 0 )
					go.destroy()
				
				return this.destroy()
			}
			
			if ( go.objectID !== IDPlayer && go.objectID !== IDBullet ) {
				return this.destroy()
			}
		}
		
		vec2.copy(this.pos, newPos)
		this.calcBBox(this.bbox, this.pos)
	}

	ii = 0
	draw() {
		//( Date.now() % 100 ) % 3
		//this.sg.sg16x16.draw(0, 5, this.pos[0], this.pos[1])

		const sprite = this.sg.sg16x16.frames[5]

		const w = 8
		const h = 8
		
		const { cnv, ctx } = getContext()
		ctx.save()		
		
		ctx.translate(this.pos[0], cnv.height - this.pos[1] - h)
		ctx.translate(-w/2, +h/2)
		
		const [rx, ry] = [w/2, h/2]
		ctx.translate(+rx, +ry)
		ctx.rotate( -this.angle )
		ctx.translate(-rx, -ry)

		ctx.drawImage(
			sprite.texture, 
			sprite.x, sprite.y, sprite.width, sprite.height,			
			0,0, w, h
		)
		
		ctx.restore()

	}

	intersection(gameObject) {
		this.destroy()
	}
}
