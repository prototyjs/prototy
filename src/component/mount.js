/**
 * @param { HTMLElement } element
 * @param { DocumentFragment } node
 * @param { Function } setup
 */
export function mount(element, node, setup) {
	setup(node)
	if (element._slots) {
		const slots = node.querySelectorAll('slot')
		slots.forEach(slot => {
			const name = slot.getAttribute('name') || 'default'
			const content = element._slots[name]
			if (content) {
				slot.replaceWith(content)
			} else {
				if (slot.childNodes.length === 0) {
					slot.remove()
				} else {
					slot.replaceWith(...slot.childNodes)
				}
			}
		})
	}
	element.appendChild(node)
}