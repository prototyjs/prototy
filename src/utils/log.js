import { isObject } from '@/utils/isObject'

const isDev = process.env.NODE_ENV !== 'production'

// log.warn('Invalid prop type: "{0}" expected to be a string, but received {1}.', propName, typeof value)

export const log = {
	/**
	 * @param { string } text
	 * @param { Array } [args=[]]
	 */
	error(text, ...args) {
		if (isDev) {
			console.error(`[PROTOTY] ${format(text, args)}`)
		}
	},
	warn(text, ...args) {
		if (isDev) {
			console.warn(`[PROTOTY] ${format(text, args)}`)
		}
	}
}

/**
 * @param { string } text
 * @param { Array } args
 * @returns { string }
 */
function format(text, args) {
	return args.reduce((m, v, i) => {
		const val = isObject(v) ? JSON.stringify(v) : v
		return m.replace(`{${i}}`, val)
	}, text)
}