import { render } from '@/component/render'
import { slots } from '@/component/slots'
import { dispatchEvent } from '@/utils/dispatchEvent'
import { bindMethods } from '@/utils/bindMethods'
/**
 * @param { HTMLElement } element
 * @param { string } value
 * @param { object } api
 * @param { object } bus
 */
export function component(element, value = {}, api, bus) {
	if (element._abortController) {
		element._abortController.abort()
	}
	const controller = new AbortController()
	element._abortController = controller

	const remove = (node) => {
		while (node.firstChild) {
			api.unprocess(node.firstChild, node.els)
			node.firstChild.remove()
		}
	}

	if (element._component) {
		dispatchEvent(element, 'destroy', { name: element._component })
		remove(element)
	}

	if (!value || !value.template) {
		element.innerHTML = ''
		return
	}
	element.els = {}
	const componentBus = {
		...bus,
		params: {
			...bus.params,
			...value.params
		},
		methods: {
			...bus.methods
		}
	}
	bindMethods(componentBus.methods, value.methods, componentBus)

	const setup = (node) => {
		api.setup(node, componentBus, element.els)
	}

	const node = render(value.template)
	element._component = value.name

	if (element._hasEach) {
		slots(element, node, setup)
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
		slots(element, node, setup)
		remove(element)
		element.appendChild(node)
		Array.from(element.children).forEach(child => {
			setup(child)
		})
	}
	if (element._async) {
		dispatchEvent(element, 'create', { name: value.name, signal: controller.signal }, start)
	} else {
		start()
		dispatchEvent(element, 'create', { name: value.name })
	}
}