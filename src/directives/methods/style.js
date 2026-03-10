import { isObject } from '../../utils/isObject.js'
/**
 *
 * @param {HTMLElement} element
 * @param {object} value
 * @returns {any}
 */
export function style(element, value) {
	if (!isObject(value)) {
		// eslint-disable-next-line no-console
		return console.error('error style')
	}
	Object.assign(element.style, value)
}