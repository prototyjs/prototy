import { render } from '@/component/render'
import { slots } from '@/component/slots'
import { dispatchEvent } from '@/utils/dispatchEvent'

/**
 * @param { HTMLElement } element
 * @param { string } value
 * @param { object } methods
 */
export function component(element, value = {}, methods) {
	if (element._abortController) {
		element._abortController.abort()
	}
	const controller = new AbortController()
	element._abortController = controller

	if (element._component) {
		dispatchEvent(element, 'destroy', { name: element._component })
		while (element.firstChild) {
			if (methods.unprocess) {
				methods.unprocess(element.firstChild)
			}
			element.firstChild.remove()
		}
	}

	if (!value || !value.template) {
		element.innerHTML = ''
		return
	}

	const node = render(value.template)
	element._component = value.name

	if (element._hasEach) {
		slots(element, node, methods.setup)
		const template = node.firstElementChild

		if (template) {
			element._template = template
			element.innerHTML = ''
		}
		return
	}

	const start = () => {
		if (controller.signal.aborted) {
			return
		}

		slots(element, node, methods)

		while (element.firstChild) {
			methods.unprocess(element.firstChild)
			element.firstChild.remove()
		}

		element.appendChild(node)

		Array.from(element.children).forEach(child => {
			methods.setup(child)
		})
	}

	if (element._async) {
		dispatchEvent(element, 'create', { name: value.name, signal: controller.signal }, start)
	} else {
		start()
		dispatchEvent(element, 'create', { name: value.name })
	}
}