import { isObject } from '../../utils/isObject.js'
/**
 *
 * @param {HTMLElement} element
 * @param {object} value
 * @returns {void}
 */
export function classes(element, value) {
	if (!isObject(value)) {
		// eslint-disable-next-line no-console
		return console.error('error class')
	}
	Object.entries(value).forEach(([className, condition]) => {
		element.classList.toggle(className, !!condition)
	})
}