/**
 * @param {string} str
 * @returns {string}
 */
export function kebabToCamel(str) {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}