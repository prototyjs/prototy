import { render } from '@/utils/render'
import { dispatchEvent } from '@/utils/dispatchEvent'

/**
 * @param { HTMLElement } element
 * @param { string } value
 * @param { Function } setup
 */
export function component(element, value= {}, setup) {
	if (element._abortController) {
		element._abortController.abort()
	}
	const controller = new AbortController()
	element._abortController = controller
	const { signal } = controller

	if (element._component) {
		dispatchEvent(element, 'destroy', { name: element._component })
		element._component = null
	}

	if (!value || !value.template) {
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
			dispatchEvent(element, 'create', { name: value.name, signal }, () => {
				if (signal.aborted) {
					return
				}
				setup(node)
				element.appendChild(node)
			})
		} else {
			setup(node)
			element.appendChild(node)
			dispatchEvent(element, 'create', { name: value.name })
		}

	}
}