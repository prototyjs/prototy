/**
 * @param { HTMLElement } container
 * @param { Array<Record<string, any>> } array
 * @param { object } methods
 */
export function each(container, array, methods) {
	const nodeMap = container._nodeMap || (container._nodeMap = new WeakMap())
	const children = container.children
	const arrLength = array?.length || 0

	if (!arrLength) {
		while (container.firstChild) {
			const node = container.firstChild
			container.dispatchEvent(new CustomEvent('destroy', {
				detail: {
					node,
					item: node._item,
					index: node._index,
					type: 'each-item'
				}
			}))
			methods.unprocess(node)
			node.remove()
		}
		return
	}

	for (let i = 0; i < arrLength; i++) {
		const item = array[i]
		let node = nodeMap.get(item)

		if (!node) {
			node = container._template.cloneNode(true)
			nodeMap.set(item, node)
			container.insertBefore(node, children[i] || null)

			node._item = item
			node._index = i

			methods.context(node, { item, index: i })

			container.dispatchEvent(new CustomEvent('create', {
				detail: {
					node,
					item,
					index: i,
					type: 'each-item'
				}
			}))

			methods.setup(node)
		} else {
			if (children[i] !== node) {
				container.insertBefore(node, children[i] || null)
			}

			const oldIndex = node._index
			node._item = item
			node._index = i

			methods.context(node, { item, index: i })

			if (oldIndex !== i) {
				container.dispatchEvent(new CustomEvent('update', {
					detail: {
						node,
						item,
						oldIndex,
						newIndex: i,
						type: 'each-item'
					}
				}))
			}
		}
	}

	while (container.children.length > arrLength) {
		const nodeToRemove = container.lastElementChild
		container.dispatchEvent(new CustomEvent('destroy', {
			detail: {
				node: nodeToRemove,
				item: nodeToRemove._item,
				index: nodeToRemove._index,
				type: 'each-item'
			}
		}))
		methods.unprocess(nodeToRemove)
		nodeToRemove.remove()
	}
}