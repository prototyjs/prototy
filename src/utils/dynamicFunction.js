import { log } from '@/log'

const PLACEHOLDER = Symbol('dynamic-value-placeholder')

/**
 * @param { string } code
 * @param { object } bus
 * @param { object } context
 * @param { string } [key='']
 * @returns { Function }
 */
export function dynamicFunction(code, bus, context= {}, key = '') {
	const mergedContext = { ...bus, ...context }
	if (key) {
		mergedContext[key] = PLACEHOLDER
	}

	const keys = Object.keys(mergedContext)
	const values = Object.values(mergedContext)

	// eslint-disable-next-line sonarjs/code-eval
	const fn = new Function('el', ...keys, `return ${code}`)

	return (el, value) => {
		const newValues = values.map(v => v === PLACEHOLDER  ? value : v)
		try {
			return fn(el, ...newValues)
		} catch (err) {
			log.error(err.toString(), el)
			return undefined
		}
	}
}