
import { Howl } from './lib/howlerjs/index.js'
import { getAbsPath } from './PathMgr.js'

const soundsMap = {}

const getSound = path => {
	if ( soundsMap[ path ] )
		return soundsMap[ path ]
	
	return soundsMap[ path ] = new Howl({
		src: [ getAbsPath(path) ]
	})
}

export const playSound = path => {
	getSound(path).play()
}

globalThis.playSound = playSound