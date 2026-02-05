/**
 * @param {Document|Element|ShadowRoot} root
 * @param {Function} fnProperty
 * @param {Function} fnListener
 * @returns {Array<HTMLElement>}
 */
export function findElements(root, fnProperty, fnListener) {
	/** @typedef {HTMLElement & { _reactivity: Record<string, any> }} ReactiveElement */
	const results = []
	const xpath = './/*[@*[starts-with(name(), \':\')]]'

	const nodes = document.evaluate(
		xpath,
		root,
		null,
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
		null
	)

	const _kebabToCamel = (str) => {
		return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
	}

	for (let i = 0; i < nodes.snapshotLength; i++) {

		const rawNode = nodes.snapshotItem(i)

		if (!(rawNode instanceof HTMLElement)) {
			continue
		}
		const element = /** @type {any} */ (rawNode)
		element._reactivity = {}
		element._listeners = {}

		Array.from(element.attributes).forEach(attr => {
			if (attr.name.startsWith(':')) {
				const key = _kebabToCamel(attr.name.slice(1))
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