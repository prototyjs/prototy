import { log } from '@/log'

/**
 * @param { HTMLElement } element
 * @param { string } key
 * @param { object } directives
 */
export function prepareElement(element, key, directives = {}) {
	if (key === 'each' || key.startsWith('each.')) {
		const hasContent = element.firstElementChild || element.textContent.trim() !== ''
		if (hasContent) {
			if (!element.hasAttribute(':component') && !element._component && !directives.component) {
				element._template = element.firstElementChild.cloneNode(true)
				element.innerHTML = ''
			} else {
				log.error('Content (slots) is not allowed inside the :each directive.', element)
			}
		}
		return
	}
	if (key === 'component' || key.startsWith('component.')) {
		element._hasEach = element.hasAttribute(':each') ||
			element.hasAttribute(':each.once') ||
			element._hasEach ||
			!!directives.each ||
			!!directives['each.once']
		if (element._slots) {
			return
		}
		element._slots = {}
		Array.from(element.childNodes).forEach(node => {
			if (node.nodeType === 3 && !node.textContent.trim()) {
				node.remove()
				return
			}
			const name = (node.nodeType === 1 && node.getAttribute('slot')) || 'default'
			if (element._slots[name]) {
				log.error('Slot "{0}" is already occupied in component', name, element)
				return
			}
			node._keep = true
			element._slots[name] = node
			node.remove()
		})
	}
}