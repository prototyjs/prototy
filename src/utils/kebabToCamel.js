/**
 * @param {string} str
 * @return {string}
 */
export function kebabToCamel(str) {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}