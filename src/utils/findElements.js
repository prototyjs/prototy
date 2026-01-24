/**
 * @param {Document|Element|ShadowRoot} root
 * @param {Function} fn
 * @returns {Array<{element: HTMLElement, attributes: Record<string, string>}>}
 */
export function findElements(root, fn) {
	/** @type {Array<{element: HTMLElement, attributes: Record<string, string>}>} */
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
		const element = nodes.snapshotItem(i)

		if (!(element instanceof HTMLElement)) {
			continue
		}

		/** @type {Record<string, string>} */
		const colonAttrs = {}

		Array.from(element.attributes).forEach(attr => {
			if (attr.name.startsWith(':')) {
				colonAttrs[attr.name.slice(1)] = fn(attr.value)
			}
		})
    
		if (Object.keys(colonAttrs).length > 0) {
			results.push({
				element,
				attributes: colonAttrs
			})
		}
	}
	return results
}