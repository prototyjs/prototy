/**
 * @param { HTMLElement } element
 * @param { DocumentFragment } node
 * @param { Function } setup
 */
export function mount(element, node, setup) {
	if (element._slots) {
		const slots = node.querySelectorAll('slot')
		slots.forEach(slot => {
			const name = slot.getAttribute('name') || 'default'
			const content = element._slots[name]
			if (content) {
				slot.replaceWith(content)
				if (!content._mounted) {
					setup(content)
					content._mounted = true
				}
			} else {
				if (slot.childNodes.length === 0) {
					slot.remove()
				} else {
					slot.replaceWith(...slot.childNodes)
				}
			}
		})
	}
	setup(node)
	element.appendChild(node)
}