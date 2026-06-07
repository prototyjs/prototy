import { isObject } from '@/utils/isObject'

export const log = {
	/**
	 * @param { string } text
	 * @param { Array } [args=[]]
	 */
	error(text, ...args) {
		if (!import.meta.env.PROD) {
			console.error(`[PROTOTY] ${format(text, args)}`, ...args)
		}
	},
	warn(text, ...args) {
		if (!import.meta.env.PROD) {
			console.warn(`[PROTOTY] ${format(text, args)}`, ...args)
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
		let val = v
		if (isObject(v) && !(v instanceof HTMLElement)) {
			try {
				val = JSON.stringify(v)
				val = val.length > 100 ? val.slice(0, 100) + '...' : val
			} catch {
				val = String(v)
			}
		}
		return m.split(`{${i}}`).join(String(val))
	}, text)
}