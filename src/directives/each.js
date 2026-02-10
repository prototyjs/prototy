/**
 * @param {Array<Object>} array
 * @param {HTMLElement} container
 * @param {Function} setup
 */
export function each(array, container, setup){
	if (!container) return

	// @ts-ignore
	const nodeMap = container._nodeMap || (container._nodeMap = new WeakMap())
	const children = container.children
	const arrLength = array?.length || 0

	if (!arrLength) {
		container.innerHTML = ''
		return
	}

	for (let i = 0; i < arrLength; i++) {
		const item = array[i]
		let node = nodeMap.get(item)

		if (!node) {
			// @ts-ignore
			node = container._template.cloneNode(true)
			node.removeAttribute('template')
			nodeMap.set(item, node)
			setup(node, item)
		}

		if (children[i] !== node) {
			container.insertBefore(node, children[i] || null)
		}
	}

	const diff = children.length - arrLength
	if (diff > 0) {
		for (let i = children.length - 1; i >= arrLength; i--) {
			children[i].remove()
		}
	}
}