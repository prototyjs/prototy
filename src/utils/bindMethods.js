/**
 * @param { object } target
 * @param { object } source
 * @param { object } context
 */
export function bindMethods(target, source, context) {
	for (const [key, value] of Object.entries(source)) {
		if (typeof value === 'function') {
			target[key] = value.bind(context)
		}
	}
}