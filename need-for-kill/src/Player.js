
const PLAYER_STATE_IDLE       = 0b1
const PLAYER_STATE_MOVE       = 0b10

const PLAYER_STATE_LOOK_LEFT  = 0b100
const PLAYER_STATE_LOOK_RIGHT = 0b1000

const PLAYER_STATE_STANDING   = 0b10000
const PLAYER_STATE_CROUCH     = 0b100000
const PLAYER_STATE_DIE        = 0b1000000

export const PLAYER_STATE = {
	Idle     : PLAYER_STATE_IDLE,
	Move     : PLAYER_STATE_MOVE,
	
	LookLeft : PLAYER_STATE_LOOK_LEFT,
	LookRight: PLAYER_STATE_LOOK_RIGHT,

	Standing : PLAYER_STATE_STANDING,
	Crouch   : PLAYER_STATE_CROUCH,
	Die      : PLAYER_STATE_DIE,
}

const PlayerStateGroups = [
	{
		mask   : PLAYER_STATE_IDLE | PLAYER_STATE_MOVE,
		default: PLAYER_STATE_IDLE,
	},
	{
		mask   : PLAYER_STATE_LOOK_LEFT | PLAYER_STATE_LOOK_RIGHT,
		default: PLAYER_STATE_LOOK_RIGHT,
	},
	{
		mask   : PLAYER_STATE_STANDING | PLAYER_STATE_CROUCH | PLAYER_STATE_DIE,
		default: PLAYER_STATE_STANDING,
	},
]

globalThis.PLAYER_STATE = PLAYER_STATE

export class Player {
	pos = { x: 0, y: 0}
	playerModel = null
	state = PLAYER_STATE_IDLE | PLAYER_STATE_LOOK_RIGHT | PLAYER_STATE_STANDING
	
	
	ani = null
	stopAni = true

	constructor(playerModel) {
		this.playerModel = playerModel
		this.updateAni()
	}
	
	setState(state) {
		if ( this.state !== state ) {
			this.state = state
			this.updateAni()
		}
	}
	addState(state) {
		let prevState = this.state
		for(const g of PlayerStateGroups) {
			const localState = state & g.mask
			if ( localState ) {
				prevState &= ~g.mask
				prevState |= localState
			}
		}

		this.setState(prevState)
	}
	delState(state) {
		let prevState = this.state
		for(const g of PlayerStateGroups) {
			const localState = state & g.mask
			if ( localState ) {
				prevState &= ~localState
				if ( !(prevState & g.mask) )
					prevState |= g.default
			}
		}

		this.setState(prevState)
	}
	clearState() {
		this.setState(PLAYER_STATE.Idle)
	}
	getStateStr() {
		return Object
			.keys(PLAYER_STATE)
			.map(k => this.state & PLAYER_STATE[k] ? k : '')
			.filter(Boolean)
			.join(', ')
	}
	
	updateAni() {
		console.log( this.getStateStr() )
		let lookName = 'right'
		let ani = this.playerModel.walk
		this.stopAni = true
		
		if ( this.state & PLAYER_STATE.LookLeft )
			lookName = 'left'
		
		if ( this.state & PLAYER_STATE.Standing )
			ani = this.playerModel.walk
		
		if ( this.state & PLAYER_STATE.Crouch )
			ani = this.playerModel.crouch
		
		if ( this.state & PLAYER_STATE.Die )
			ani = this.playerModel.die
		
		if ( this.state & PLAYER_STATE.Move )
			this.stopAni = false
		
		this.ani = ani[ lookName ]
		
		this.startAniTime = Date.now()
	}
	
	draw(ctx) {
		const now = Date.now()
		const frameTime = now - this.prevFrameTime
		this.prevFrameTime = now
		
		const aniTime = now - this.startAniTime

		let aniIndex = (aniTime / (this.ani.frameRefreshTime * 15)) | 0
		
		if ( this.stopAni )
			aniIndex = 0

		//const x = (aniIndex * this.modelSizeX) % this.walkTex.width
		const srcRect = this.ani.frames[ aniIndex % this.ani.frames.length ]
		
		const x = 32*6
		const y = 16*14
		ctx.drawImage(
			srcRect.texture, 
			srcRect.x, srcRect.y, srcRect.width, srcRect.height,
			x, y - srcRect.height, srcRect.width, srcRect.height
		)
		
		
		
		
		this.prevAniIndex = this.prevAniIndex ?? aniIndex
		if ( this.prevAniIndex !== aniIndex ) {
			this.prevAniIndex = aniIndex
		//	console.log(aniIndex  % this.walkFramesList.length )
		}
	}
}
