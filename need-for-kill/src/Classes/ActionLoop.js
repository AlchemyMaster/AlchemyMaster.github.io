
import { drawSpriteCX, getFrameTimeSec, getFrameDeltaTimeSec, getContext } from './../Render.js'

export class ActionLoop {
	startTime = getFrameTimeSec()

	update(numPerSec, callback) {
		const reloadTime = 1 / numPerSec
		
		if ( this.startTime > getFrameTimeSec() )
			return
		
		this.startTime = getFrameTimeSec() + reloadTime
		callback()
	}
}