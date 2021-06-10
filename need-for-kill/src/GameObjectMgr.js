
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
export const getGameObjectListByObjectID = objectID => {
	if ( !gameObjectMapList[ objectID ] )
		gameObjectMapList[ objectID ] = []
	
	return gameObjectMapList[ objectID ]
}

export const getCollisions = (src, dst) => {
	return gameObjectList.filter(v => v.bbox.isPointInBBox(dst))
}
export const getCollisionsBBox = (bbox) => {
	return gameObjectList.filter(v => v.bbox.isBBoxInBBox(bbox))
}



globalThis.gameObjectList = gameObjectList
globalThis.gameObjectMapList = gameObjectMapList
globalThis.getGameObjectListByObjectID = getGameObjectListByObjectID