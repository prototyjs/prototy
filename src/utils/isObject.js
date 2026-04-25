/**
 * @param { object } value
 * @returns { boolean } true or false.
 */
export function isObject(value) {
	return typeof value === 'object' && value !== null
}