
import * as vec2 from './lib/glmatrix/vec2.js'

const gameObjectList = []

const gameObjectMapList = {}

const arrayDelItem = (array, item) => {
	const index = array.indexOf(item)
	if ( index !== -1 )
		array.splice(index, 1)
}

export const addGameObject = gameObject => {
	gameObjectList.push( gameObject )
	getGameObjectListByObjectID( gameObject.objectID ).push( gameObject )
}
export const delGameObject = gameObject => {
	arrayDelItem(gameObjectList, gameObject)
	arrayDelItem(getGameObjectListByObjectID(gameObject.objectID), gameObject)
}
export const getGameObjectList = () => gameObjectList
export const getGameObjectListByObjectID = objectID => {
	if ( !gameObjectMapList[ objectID ] )
		gameObjectMapList[ objectID ] = []
	
	return gameObjectMapList[ objectID ]
}

export const getCollisions = (src, dst, skipGameObject) => {
	const sx = src[0]
	const sy = src[1]
	const dx = dst[0]
	const dy = dst[1]

	const _minX = Math.min(sx, dx)
	const _minY = Math.min(sy, dy)
	const _maxX = Math.max(sx, dx)
	const _maxY = Math.max(sy, dy)
	
	const dir = vec2.sub([], dst, src)
	const a = dir[1] / dir[0]
	const k = - src[0] * a + src[1]
	
	// y = x * a + k
	// y - k = x * a
	// (y - k)/a = x
	
	const checkPoint = (x, y) => ( x >= _minX && x <= _maxX && y >= _minY && y <= _maxY )	

	let findMinDistPow2 = Number.POSITIVE_INFINITY
	let findX = 0
	let findY = 0
	let findGameObject = null
	let findNormal = null

	const EPS_X = 0.0001
	const EPS_Y = 0.0001
	
	const filterCallback = ( typeof skipGameObject === 'function' ) ?
		skipGameObject :
		gameObject => gameObject !== skipGameObject

	const collProcess = (x, y, gameObject, normal) => {
		if ( !filterCallback(gameObject) )
			return
		
		if ( !checkPoint(x, y) )
			return

		const xSsx = x - sx
		const ySsy = y - sy
		const distPow2 = xSsx*xSsx + ySsy*ySsy
		if ( distPow2 < findMinDistPow2 ) {
//console.log(distPow2, x, y, gameObject.pos[0], gameObject.pos[1])
			findMinDistPow2 = distPow2
			findX = x
			findY = y
			findGameObject = gameObject
			findNormal = normal
		}
	}
	
	const normalLeft   = [-1, +0]
	const normalRight  = [+1, +0]
	const normalTop    = [+0, +1]
	const normalBottom = [+0, -1]
	
	const collProcessGameObjectFull = go => {
		const bbox = go.bbox
		const minX = bbox.min[0]
		const minY = bbox.min[1]
		const maxX = bbox.max[0]
		const maxY = bbox.max[1]
			
		const y0 = minX * a + k
		if ( y0 >= minY && y0 <= maxY )
			collProcess(minX, y0, go, normalLeft)
			
		const y1 = maxX * a + k
		if ( y1 >= minY && y1 <= maxY )
			collProcess(maxX, y1, go, normalRight)
			
		const x0 = (minY - k) / a
		if ( x0 >= minX && x0 <= maxX )
			collProcess(x0, minY, go, normalBottom)
			
		const x1 = (maxY - k) / a
		if ( x1 >= minX && x1 <= maxX )
			collProcess(x1, maxY, go, normalTop)
	}
	const collProcessGameObjectVertical = go => {
		const bbox = go.bbox
		const minX = bbox.min[0]
		const minY = bbox.min[1]
		const maxX = bbox.max[0]
		const maxY = bbox.max[1]

		if ( sx >= minX && sx <= maxX ) {
			collProcess(sx, minY, go, normalBottom)
			collProcess(sx, maxY, go, normalTop)
		}
	}
	const collProcessGameObjectHorizontal = go => {
		const bbox = go.bbox
		const minX = bbox.min[0]
		const minY = bbox.min[1]
		const maxX = bbox.max[0]
		const maxY = bbox.max[1]

		if ( sy >= minY && sy <= maxY ) {
			collProcess(minX, sy, go, normalLeft)
			collProcess(maxX, sy, go, normalRight)
		}
	}

	if ( Math.abs(dir[0]) < EPS_X )
		gameObjectList.map(collProcessGameObjectVertical)
	else
	if ( Math.abs(dir[1]) < EPS_Y )
		gameObjectList.map(collProcessGameObjectHorizontal)
	else
		gameObjectList.map(collProcessGameObjectFull)

	if ( findGameObject ) {
		return {
			pos: [ findX, findY ],
			gameObject: findGameObject,
		}
	}
	
	return null
}
export const getCollisionsBBox = (bbox) => {
	return gameObjectList.filter(v => v.bbox.isBBoxInBBox(bbox))
}


globalThis.getCollisions = getCollisions
globalThis.gameObjectList = gameObjectList
globalThis.gameObjectMapList = gameObjectMapList
globalThis.getGameObjectListByObjectID = getGameObjectListByObjectID