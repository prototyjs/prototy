import { kebabToCamel } from '@/utils/kebabToCamel'

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
		this.priority = { ':props': 1, ':component': 2, ':each': 3 }
	}
	/**
	 * @param { HTMLElement } node
	 * @param { Function } handler
	 */
	// eslint-disable-next-line sonarjs/cognitive-complexity
	process(node, handler) {
		const stack = [node]
		while (stack.length) {
			const current = stack.pop()
			if (current.nodeType === 1 || current.nodeType === 11) {
				let hasDirectives = false
				if (current.nodeType === 1) {
					const attrs = Array.from(current.attributes)
					attrs.sort((a, b) => (this.priority[a.name] || 99) - (this.priority[b.name] || 99))
					const toRemove = []

					for (let i = 0; i < attrs.length; i++) {
						const attr = attrs[i]
						this.attribute(current, attr.name, attr.value)
						if (attr.name.charCodeAt(0) === 58) {
							hasDirectives = true
							this.directive(attr, current, handler, toRemove)
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
	 */
	directive(attr, node, handler, toRemove) {
		const name = attr.name.slice(1)
		const key = kebabToCamel(name)

		if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) {
			this.listeners(node, key.slice(2).toLowerCase(), attr.value)
		} else {
			handler(node, key, attr.value)
		}
		toRemove.push(attr.name)
	}
	/**
	 * @param { HTMLElement } node
	 */
	unprocess(node) {
		const stack = [node]
		while (stack.length) {
			const current = stack.pop()
			if (current._keep) {
				continue
			}

			if (this.nodes.has(current)) {
				this.destroy(current)
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