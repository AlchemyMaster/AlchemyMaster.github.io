
async function DracoDecoderWrapper(workerUrl) {
	const PromiseWrapper = () => {
		let resolve
		let reject
		const promise = new Promise((res, rej) => {
			resolve = res
			reject  = rej
		})
		promise.resolve = resolve
		promise.reject  = reject
		return promise
	}

	return new Promise((resolve, reject) => {
		
		const WorkerState_Init = 1
		const WorkerState_Work = 2
		//console.log("Init!!")
		const worker = new Worker(workerUrl)
		let workerState = WorkerState_Init
		
		let nextWorkID = 1
		const works = {}
		const decodeBuffer = buffer => {
			const workID = nextWorkID++
			
			worker.postMessage({ workID, buffer }, [buffer])
			
			const promise = PromiseWrapper()
			
			works[ workID ] = promise
			
			return promise
		}
		const this_ = { decodeBuffer }
		
		worker.onmessage = e => {
			if ( workerState === WorkerState_Init ) {
				workerState = WorkerState_Work
				resolve(this_)
				return
			}
			
			const { workID, errorMessage, result } = e.data
			const work = works[workID]
			delete works[workID]
			
			if ( work ) {
				if ( errorMessage )
					work.reject( new Error(errorMessage) )
				
				work.resolve( result )
			}
		}
		
		worker.onerror = e => {
			if ( workerState === WorkerState_Init )
				reject( e )
		}
	})
}
