import { kebabToCamel } from './kebabToCamel'

/**
 * @param {HTMLElement} root
 * @param {Function} fnProperty
 * @param {Function} fnListener
 * @returns {Array<HTMLElement>}
 */
export function findElements(root, fnProperty, fnListener) {
	/** @typedef {HTMLElement & { _reactivity: Record<string, any> }} ReactiveElement */
	const results = []
	const xpath = 'descendant-or-self::*[@*[starts-with(name(), ":")]]' // './/*[@*[starts-with(name(), \':\')]]'

	const nodes = document.evaluate(
		xpath,
		root,
		null,
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
		null
	)

	for (let i = 0; i < nodes.snapshotLength; i++) {

		const rawNode = nodes.snapshotItem(i)

		if (!(rawNode instanceof HTMLElement) || rawNode.hasAttribute('template')) continue

		const element = /** @type {any} */ (rawNode)

		Array.from(element.attributes).forEach(attr => {
			if (attr.name.startsWith(':each')) {
				element._template = element.firstElementChild.cloneNode(true)
				element.firstElementChild.remove()
			}
			if (attr.name.startsWith(':')) {
				if (!element.hasOwnProperty('_reactivity')) element._reactivity = {}
				if (!element.hasOwnProperty('_listeners')) element._listeners = {}
				const key = kebabToCamel(attr.name.slice(1))
				if (key.startsWith('on')) {
					fnListener(element, key.slice(2), attr.value)
				} else {
					const reactivity = element._reactivity[key] = {}
				    fnProperty(element, key, reactivity, attr.value)
				}
			}
		})

		results.push(element)
	}
	return results
}