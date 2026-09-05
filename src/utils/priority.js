export const DIRECTIVE_PRIORITY = {
	'props': 1,
	'component': 2,
	'component.async': 3,
	'each': 4,
	'each.once': 5
}
/**
 * @param { string } key
 * @returns { number }
 */
export function priority(key) {
	const cleanKey = key.startsWith(':') ? key.slice(1) : key
	if (cleanKey === 'el') {
		return -1
	}
	if (DIRECTIVE_PRIORITY[cleanKey] !== undefined) {
		return DIRECTIVE_PRIORITY[cleanKey]
	}
	const base = cleanKey.split('.')[0]
	if (DIRECTIVE_PRIORITY[base] !== undefined) {
		return DIRECTIVE_PRIORITY[base]
	}
	return 100
}