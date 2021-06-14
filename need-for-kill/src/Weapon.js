
import { Item } from './Item.js'
import { playSound } from './SoundMgr.js'
import { setTimeout } from './Render.js'
import { getCacheResource, getResource } from './ResourceMgr.js'
import { SpriteGrid } from './Classes/SpriteGrid.js'


const WeaponInfoMap = {
	Shotgun: {
		id: 1,
		maxNumAmmo: 100,
		respawnTime: 20e3,
	},
	Grenade: {
		id: 2,
		maxNumAmmo: 100,
		respawnTime: 20e3,
	},
	Rocket: {
		id: 3,
		maxNumAmmo: 100,
		respawnTime: 20e3,
	},
	Shaft: {
		id: 4,
		maxNumAmmo: 100,
		respawnTime: 40e3,
	},
	Rail: {
		id: 5,
		maxNumAmmo: 100,
		respawnTime: 30e3,
	},
	Plasma: {
		id: 6,
		maxNumAmmo: 100,
		respawnTime: 20e3,
	},
	Bfg: {
		id: 7,
		maxNumAmmo: 50,
		respawnTime: 100e3,
	}	
}
const WeaponInfoMapByBrickIndex = {
	1: WeaponInfoMap.Shotgun,
	2: WeaponInfoMap.Grenade,
	3: WeaponInfoMap.Rocket,
	4: WeaponInfoMap.Shaft,
	5: WeaponInfoMap.Rail,
	6: WeaponInfoMap.Plasma,
	7: WeaponInfoMap.Bfg,
}

export class Weapon extends Item {
	sg = getCacheResource( 'Weapon_df923kbrs', () => new SpriteGrid(getResource('item').cnv, 32, 16) )

	constructor(cx, y, brickIndex) {
		super(cx, y, 18, 10, brickIndex)
	}
	
	draw() {
		this.sg.drawCX(this.brickIndex, this.pos[0], this.pos[1])	
	}

	intersection(gameObject) {
		playSound('basenfk/sound/wpkup.wav')
		this.destroy()
	}
	destroy() {	
		this.release()
		
		setTimeout(() => {
			new Weapon(this.pos[0], this.pos[1], this.brickIndex)
		}, WeaponInfoMapByBrickIndex[ this.brickIndex ].respawnTime)
	}
}

class WeaponShotgun extends Weapon {
	respawnTime = 20e3
}
class WeaponGrenade extends Weapon {
	respawnTime = 20e3
}
class WeaponRocket extends Weapon {
	respawnTime = 20e3
}
class WeaponShaft extends Weapon {
}
class WeaponRail extends Weapon {
	respawnTime = 20e3
}
class WeaponPlasma extends Weapon {
	respawnTime = 20e3
}
class WeaponBfg extends Weapon {
	respawnTime = 100e3
}

