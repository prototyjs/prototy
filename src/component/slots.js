/**
 * @param { HTMLElement } element
 * @param { DocumentFragment } node
 * @param { object } methods
 */
export function slots(element, node, methods) {
	if (!element._slots) {
		return
	}
	node.querySelectorAll('slot').forEach(slot => {
		const name = slot.getAttribute('name') || 'default'
		const content = element._slots[name]
		if (content) {
			const clone = content.cloneNode(true)

			slot.replaceWith(clone)
			slot._currentClone = clone

			if (!clone._mounted) {
				methods.setup(clone)
				clone._mounted = true
			}
		} else {
			slot.childNodes.length === 0 ? slot.remove() : slot.replaceWith(...slot.childNodes)
		}
	})
}