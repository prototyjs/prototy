import { kebabToCamel } from '@/utils/kebabToCamel'
import { priority } from '@/utils/priority'
/**
 *
 */
export class Nodes {
	/**
	 * @param { object } options
	 * @param { Function } options.listeners
	 * @param { Function } options.destroy
	 */
	constructor({ listeners, destroy, attribute }) {
		this.listeners = listeners
		this.destroy = destroy
		this.attribute = attribute
		this.nodes = new WeakSet()
	}
	/**
	 * @param { HTMLElement } node
	 * @param { object } bus
	 * @param { object } els
	 * @param { Function } handler
	 */
	// eslint-disable-next-line sonarjs/cognitive-complexity
	process(node, bus, els, handler) {
		const stack = [node]
		while (stack.length) {
			const current = stack.pop()
			if (current.nodeType === 1 || current.nodeType === 11) {
				let hasDirectives = false
				if (current.nodeType === 1) {
					const attrs = Array.from(current.attributes)
					attrs.sort((a, b) => {
						return priority(a.name) - priority(b.name)
					})
					const toRemove = []

					for (let i = 0; i < attrs.length; i++) {
						const attr = attrs[i]
						this.attribute(current, attr.name, attr.value, bus, els)
						if (attr.name.charCodeAt(0) === 58) {
							hasDirectives = true
							this.directive(attr, current, handler, toRemove, bus)
						} else if (attr.name === 'el') {
							hasDirectives = true
						}
					}

					for (const attrName of toRemove) {
						current.removeAttribute(attrName)
					}

					if (hasDirectives) {
						this.nodes.add(current)
					}
				}
				let child = current.lastElementChild
				while (child) {
					stack.push(child)
					child = child.previousElementSibling
				}
			}
		}
	}
	/**
	 * @param { string } attr
	 * @param { HTMLElement } node
	 * @param { Function } handler
	 * @param { Array } toRemove
	 * @param { object } bus
	 */
	directive(attr, node, handler, toRemove, bus) {
		const name = attr.name.slice(1)
		const key = kebabToCamel(name)

		if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) {
			this.listeners(node, key.slice(2).toLowerCase(), attr.value, bus)
		} else {
			handler(node, key, attr.value)
		}
		toRemove.push(attr.name)
	}
	/**
	 * @param { HTMLElement } node
	 * @param { object } els
	 */
	unprocess(node, els) {
		const stack = [node]
		while (stack.length) {
			const current = stack.pop()
			if (current._keep) {
				continue
			}

			if (this.nodes.has(current)) {
				this.destroy(current, els)
				this.nodes.delete(current)
			}

			let child = current.firstElementChild
			while (child) {
				stack.push(child)
				child = child.nextElementSibling
			}
		}
	}
}