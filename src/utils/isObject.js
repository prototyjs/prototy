/**
 * checks if an object is.
 *
 * @param { object } value
 * @returns { boolean } true or false.
 *
 * @example
 * _isObject({ a: 1 }) // => true
 *
 * @example
 * _isObject([1, 2, 3]) // => true
 *
 * @example
 * _isObject(null) // => false
 *
 * @example
 * _isObject('hello') // => false
 *
 * @example
 * _isObject(42) // => false
 */
export function _isObject(value) {
	return typeof value === 'object' && value !== null
}