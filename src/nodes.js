import { kebabToCamel } from '@/utils/kebabToCamel'

/**
 *
 */
export class Nodes {
	/**
	 * @param { object } options
	 * @param { HTMLElement } options.root
	 * @param { Function } options.listeners
	 * @param { Function } options.removed
	 */
	constructor({ root, listeners, removed }) {
		this.listeners = listeners
		this.removed = removed
		this.nodes = new WeakSet()
		this.observer = null
		this.#observer(root)
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

			if (current.nodeType === 1) {
				const attrs = current.attributes
				let hasDirectives = false

				for (let i = attrs.length - 1; i >= 0; i--) {
					const attr = attrs[i]
					if (attr.name.charCodeAt(0) === 58) {
						hasDirectives = true
						this.directive(attr, current, handler)
					}
				}

				if (hasDirectives) {
					this.nodes.add(current)
				}

				let child = current.firstElementChild
				while (child) {
					stack.push(child)
					child = child.nextElementSibling
				}
			}
		}
	}
	/**
	 * @param { string } attr
	 * @param { HTMLElement } node
	 * @param { Function } handler
	 */
	directive(attr, node, handler) {
		const name = attr.name.slice(1)
		const key = kebabToCamel(name)

		if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) {
			this.listeners(node, key.slice(2).toLowerCase(), attr.value)
		} else {
			handler(node, key, attr.value)
		}
		node.removeAttribute(attr.name)
	}
	/**
	 * @param { HTMLElement } root
	 */
	#observer(root) {
		this.observer = new MutationObserver((mutations) => {
			mutations.forEach(mutation => {
				mutation.removedNodes.forEach(node => {
					if (node.nodeType === 1) {
						this.#check(node)
					}
				})
			})
		})

		this.observer.observe(root, {
			childList: true,
			subtree: true
		})
	}

	/**
	 * @param { HTMLElement } node
	 */
	#check(node) {
		if (this.nodes.has(node)) {
			this.removed(node)
		}
		const stack = [node]
		while (stack.length) {
			const current = stack.pop()
			let child = current.firstElementChild
			while (child) {
				if (this.nodes.has(child)) {
					this.removed(child)
				}
				stack.push(child)
				child = child.nextElementSibling
			}
		}
	}
	/**
	 *
	 */
	destroy() {
		if (this.observer) {
			this.observer.disconnect()
			this.observer = null
		}
	}
}