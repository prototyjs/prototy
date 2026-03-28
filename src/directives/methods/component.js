import { render } from '@/utils/render'
import { dispatchEvent } from '@/utils/dispatchEvent'

/**
 * @param { HTMLElement } element
 * @param { string } value
 */
export function component(element, value= {}) {
	if (element._component) {
		dispatchEvent(element, 'destroy', { name: element._component })
		element._component = null
	}

	if (!value.template) {
		element.innerHTML = ''
		return
	}

	const template = render(value.template)
	element._component = value.name

	if (element.hasAttribute(':each')) {
		element._template = template.firstElementChild
	} else {
		element.innerHTML = ''
		element.appendChild(template)
		dispatchEvent(element, 'create', { name: value.name })
	}
}