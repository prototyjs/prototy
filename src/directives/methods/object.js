import { isObject } from '@/utils/isObject.js'
/**
 *
 * @param { HTMLElement } element
 * @param { object } value
 * @param { string } modifier
 * @returns { any }
 */
export function object(element, value, modifier) {
	if (!isObject(value)) {
		return
	}
	// if (modifier === 'style') {
	// 	Object.assign(element.style, value)
	// 	return
	// }
	if (modifier === 'data') {
		Object.entries(value).forEach(([key, val]) => {
			element.setAttribute(`data-${key}`, val)
		})
		return
	}
	Object.assign(element.style, value)
}