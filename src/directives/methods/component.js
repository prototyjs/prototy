import { render } from '@/utils/render.js'

/**
 * @param {HTMLElement} element
 * @param {string} value
 */
export function component(element, value) {
	if (element.hasAttribute(':each')) {
		element._template = render(value)
	} else {
		render(value, element)
	}
}