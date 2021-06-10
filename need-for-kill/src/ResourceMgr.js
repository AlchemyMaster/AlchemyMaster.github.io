
const resources = new Map()
export const addResources = map => [...map].map(v => resources.set(v[0], v[1]))
export const getResource = key => resources.get(key)

const cache = new Map()
export const getCacheResource = (key, callback) => {
	if ( cache.has(key) )
		return cache.get(key)
	
	const value = callback()
	cache.set(key, value)
	return value
}