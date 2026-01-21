/**
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export function isEqual(a, b) {
	return JSON.stringify(a) === JSON.stringify(b)
}