/**
 * @param {Document|Element|ShadowRoot} root
 * @param {Function} fn
 * @returns {Array<HTMLElement>}
 */
export function findElements(root, fn) {
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

	for (let i = 0; i < nodes.snapshotLength; i++) {

		const rawNode = nodes.snapshotItem(i)

		if (!(rawNode instanceof HTMLElement)) {
			continue
		}
		const element = /** @type {any} */ (rawNode)
		element._reactivity = {}

		Array.from(element.attributes).forEach(attr => {
			if (attr.name.startsWith(':')) {
				const key = attr.name.slice(1)
				const reactivity = element._reactivity[key] = {}
				fn(reactivity, attr.value)
			}
		})
		results.push(element)
	}
	return results
}