const PLACEHOLDER = Symbol('dynamic-value-placeholder')

/**
 * @param {string} code
 * @param {object} bus
 * @param {string} [key='']
 * @returns {Function}
 *
 * @example
 * const fn = createDynamicFunction('console.log(user)', { user: 'John' })
 * await fn() // 'John'
 *
 * @example
 * const fn = createDynamicFunction('console.log(user, count)', { user: 'John' }, 'count')
 * await fn(42) // 'John', 42
 */
export function createDynamicFunction(code, bus, key = '') {
	const context = { ...bus }
	if (key) {
		// @ts-ignore
		context[key] = PLACEHOLDER
	}

	const keys = Object.keys(context)
	const values = Object.values(context)

	// eslint-disable-next-line sonarjs/code-eval
	const fn = new Function(...keys, `return ${code}`)

	return (/** @type {any} */ value) => {
		const newValues = values.map(v => v === PLACEHOLDER  ? value : v)
		return fn(...newValues)
	}
}