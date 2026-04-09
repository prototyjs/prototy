/**
 * @param { object } components
 * @returns { object }
 */
export function mapComponents(components = {}) {
	return Object.fromEntries(
		Object.keys(components).map(key => [key, { name: key, template: components[key] }])
	)
}