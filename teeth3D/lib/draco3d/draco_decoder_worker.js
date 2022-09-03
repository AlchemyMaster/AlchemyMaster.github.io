
importScripts('draco_wasm_wrapper.js')

const assert = (f, error = 'Assert failed') => {
	if ( !f )
		throw new Error(error)
	return f
}
async function dracoDecode(data, decoderModule) {
	/// const decoderModule = await draco3d.createDecoderModule()
	const decoder = new decoderModule.Decoder()
	
	const buffer = new decoderModule.DecoderBuffer()
	buffer.Init(new Int8Array(data.buffer ?? data, data.byteOffset|0), data.byteLength)
	
	const geometryType = decoder.GetEncodedGeometryType(buffer)
	
	assert( geometryType === decoderModule.TRIANGULAR_MESH )
	
	const mesh = new decoderModule.Mesh()
    const status = decoder.DecodeBufferToMesh(buffer, mesh)
	
	const numFaces = mesh.num_faces()
	const numIndices = numFaces * 3
	const numPoints = mesh.num_points()
	
	const indices = new Uint32Array( new ArrayBuffer(numIndices * 4) )
	const ia = new decoderModule.DracoInt32Array()
	for(let i = 0; i < numFaces; i++) {
		decoder.GetFaceFromMesh(mesh, i, ia)
		const index = i * 3
		indices[index + 0] = ia.GetValue(0)
		indices[index + 1] = ia.GetValue(1)
		indices[index + 2] = ia.GetValue(2)
	}
	
	const attrs = [
		['POSITION', 3, 'vertices'],
		['COLOR', 3, 'colors'],
	]

	const result = { indices }
	attrs.map(([attrName, stride, outName]) => {
		const decoderAttr = decoderModule[attrName]
		const attrId = decoder.GetAttributeId(mesh, decoderAttr)
		const numValues = numPoints * stride
		
		assert( attrId >= 0 )
		
		const attribute = decoder.GetAttribute(mesh, attrId)
		const attributeData = new decoderModule.DracoFloat32Array()
		decoder.GetAttributeFloatForAllPoints(mesh, attribute, attributeData)
		
		assert( numValues === attributeData.size(), 'Wrong attribute size.' )
		
		const attributeDataArray = new Float32Array( new ArrayBuffer(numValues * 4) )
		for(let i = 0; i < numValues; i++)
			attributeDataArray[i] = attributeData.GetValue(i)
		
		result[ outName ] = attributeDataArray
	
		decoderModule.destroy(attributeData)
	})


	decoderModule.destroy(buffer)
	decoderModule.destroy(decoder)
	decoderModule.destroy(mesh)
	decoderModule.destroy(ia)
	
	return result
}

function Vector3( x, y, z ) {
	this.x = x || 0
	this.y = y || 0
	this.z = z || 0
}
Object.assign( Vector3.prototype, {
	subVectors: function ( a, b ) {
		this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
		return this;
	},
	multiplyScalar: function ( scalar ) {
		this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
		return this;
	},
	divideScalar: function ( scalar ) {
		return this.multiplyScalar( 1 / scalar );
	},
	length: function () {
		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );
	},
	normalize: function () {
		return this.divideScalar( this.length() || 1 );
	},
	cross: function ( v, w ) {
		if ( w !== undefined ) {
			console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
            return this.crossVectors( v, w );
		}
		
		return this.crossVectors( this, v );
	},
    crossVectors: function ( a, b ) {
		var ax = a.x, ay = a.y, az = a.z;
        var bx = b.x, by = b.y, bz = b.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
		
		return this;
	},
	fromArray: function ( array, offset ) {
		if ( offset === undefined ) offset = 0;
		
		this.x = array[ offset ];
        this.y = array[ offset + 1 ];
        this.z = array[ offset + 2 ];

        return this;
	},
} );

function createVertexNormals(indices, positions) {
	const normals = new Float32Array( new ArrayBuffer(positions.length * 4) )
	
	const pA = new Vector3(), pB = new Vector3(), pC = new Vector3()
	const cb = new Vector3(), ab = new Vector3()

	for(let i = 0; i < indices.length; i += 3) {
		const vA = indices[ i + 0 ] * 3
        const vB = indices[ i + 1 ] * 3
        const vC = indices[ i + 2 ] * 3

		pA.fromArray( positions, vA )
        pB.fromArray( positions, vB )
        pC.fromArray( positions, vC )

        cb.subVectors( pC, pB )
        ab.subVectors( pA, pB )
        cb.cross( ab )

        normals[ vA ] += cb.x
        normals[ vA + 1 ] += cb.y
        normals[ vA + 2 ] += cb.z

        normals[ vB ] += cb.x
        normals[ vB + 1 ] += cb.y
        normals[ vB + 2 ] += cb.z

        normals[ vC ] += cb.x
        normals[ vC + 1 ] += cb.y
        normals[ vC + 2 ] += cb.z
	}
	
	const nV = new Vector3()
	for(let i = 0; i < normals.length; i += 3) {
		nV.x = normals[ i + 0 ]
		nV.y = normals[ i + 1 ]
		nV.z = normals[ i + 2 ]
		
		nV.normalize()
		
		normals[ i + 0 ] = nV.x
		normals[ i + 1 ] = nV.y
		normals[ i + 2 ] = nV.z
	}
	
	return normals
}

async function main() {
	const decoderModule = await DracoDecoderModule()
	
	const startWork = async ({workID, buffer}) => {
		try {
			const result = await dracoDecode(buffer, decoderModule)
			result.normals = createVertexNormals(result.indices, result.vertices)
			
			postMessage({ workID, result, }, [result.indices.buffer, result.vertices.buffer, result.colors.buffer, result.normals.buffer])
		} catch(e) {
			postMessage({ workID, errorMessage: e.message, })
		}
	}
	
	onmessage = e => startWork(e.data)
	
	postMessage('init')
}
main()