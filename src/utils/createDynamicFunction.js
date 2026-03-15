const PLACEHOLDER = Symbol('dynamic-value-placeholder')

/**
 * @param {string} code
 * @param {object} bus
 * @param {object} context
 * @param {string} [key='']
 * @returns {Function}
 */
export function createDynamicFunction(code, bus, context= {}, key = '') {
	const mergedContext = { ...bus, ...context }
	if (key) {
		// @ts-ignore
		mergedContext[key] = PLACEHOLDER
	}

	const keys = Object.keys(mergedContext)
	const values = Object.values(mergedContext)

	// eslint-disable-next-line sonarjs/code-eval
	const fn = new Function(...keys, `return ${code}`)

	return (/** @type {any} */ value) => {
		const newValues = values.map(v => v === PLACEHOLDER  ? value : v)
		return fn(...newValues)
	}
}