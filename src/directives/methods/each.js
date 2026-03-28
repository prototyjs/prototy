/**
 * @param { HTMLElement } container
 * @param { Array<Record<string, any>> } array
 * @param { Function } setup
 */
export function each(container, array, setup) {
	if (!container) {
		return
	}
	//console.log(container)

	// @ts-ignore
	const nodeMap = container._nodeMap || (container._nodeMap = new WeakMap())
	console.log(nodeMap)
	const children = container.children
	console.log(children)
	const arrLength = array?.length || 0
	console.log(arrLength)

	if (!arrLength) {
		container.innerHTML = ''
		return
	}

	const existingNodes = new Map()
	for (let i = 0; i < children.length; i++) {
		const child = children[i]
		if (child._boundItem) {
			existingNodes.set(child._boundItem, child)
		}
	}
	console.log(existingNodes)

	for (let i = 0; i < arrLength; i++) {
		const item = array[i]
		let node = nodeMap.get(item)

		if (!node) {
			node = existingNodes.get(item)
		}
		if (!node) {
			node = container._template.cloneNode(true)
			node._boundItem = item
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
			const node = children[i]
			node.remove()
		}
	}
}