/**
 * checks if an object is.
 *
 * @param { object } value
 * @returns { boolean } true or false.
 *
 * @example
 * isObject({ a: 1 }) // => true
 *
 * @example
 * isObject([1, 2, 3]) // => true
 *
 * @example
 * isObject(null) // => false
 *
 * @example
 * isObject('hello') // => false
 *
 * @example
 * isObject(42) // => false
 */
export function isObject(value) {
	return typeof value === 'object' && value !== null
}