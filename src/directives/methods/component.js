import { render } from '@/utils/render'
import { dispatchEvent } from '@/utils/dispatchEvent'

/**
 * @param { HTMLElement } element
 * @param { string } value
 * @param { Function } setup
 */
export function component(element, value= {}, setup) {
	if (element._component) {
		dispatchEvent(element, 'destroy', { name: element._component })
		element._component = null
	}

	if (!value.template) {
		element.innerHTML = ''
		return
	}

	const node = render(value.template)
	element._component = value.name

	if (element.hasAttribute(':each')) {
		element._template = node.firstElementChild
	} else {
		element.innerHTML = ''

		if (element._async) {
			dispatchEvent(element, 'create', { name: value.name }, () => {
				setup(node)
				element.appendChild(node)
			})
		} else {
			element.appendChild(node)
		}

	}
}