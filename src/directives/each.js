import { isObject } from '@/utils/isObject'
import { renderStaticList } from '@/utils/renderStaticList'
import {bindMethods} from "@/utils/bindMethods.js";
/**
 * @param { HTMLElement } container
 * @param { Array } array
 * @param { object } api
 * @param { object } bus
 * @param { string } modifier
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function each(container, array, api, bus, modifier) {
	const isStatic = modifier === 'once' || (array?.length > 0 && !isObject(array[0]))
	const component = bus.components[container._component]
	let componentBus = bus

	if (component) {
		componentBus = {
			...bus,
			params: {
				...bus.params,
				...component.params
			},
			methods: {
				...bus.methods
			}
		}
		bindMethods(componentBus.methods, component.methods, componentBus)
	}

	const setup = (node) => {
		node.els = {}
		api.setup(node, { bus: componentBus, els: node.els, elements: component?.elements })
	}

	if (isStatic) {
		if (container._onceRendered) {
			return
		}
		renderStaticList(container, array, { context: api.context, setup })
		container._onceRendered = true
		return
	}

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
			api.unprocess(node)
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

			api.context(node, { item, index: i })

			container.dispatchEvent(new CustomEvent('create', {
				detail: {
					node,
					item,
					index: i,
					type: 'each-item'
				}
			}))
			setup(node)
		} else {
			if (children[i] !== node) {
				container.insertBefore(node, children[i] || null)
			}

			const oldIndex = node._index
			node._item = item
			node._index = i

			api.context(node, { item, index: i })

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
		api.unprocess(nodeToRemove)
		nodeToRemove.remove()
	}
}