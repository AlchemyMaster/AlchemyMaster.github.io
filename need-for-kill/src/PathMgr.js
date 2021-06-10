
let workDir = './'

export const setWorkDir = dir => {
	workDir = dir
}

export const getAbsPath = path => workDir + path