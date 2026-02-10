/**
 * @param {Array<any>} elements
 * @param {string} path
 */
export function trigger(elements = [], path, parts) {

	const dive = (/** @type {Element} */ el, /** @type {(string | number)[]} */ p) => {
		const reactivity = el._reactivity
		if (!reactivity) return

		for (const key in reactivity) {
			if (p && reactivity.each?.[p.shift()]) {
				const index = Number(p.shift())
				dive(el.children[index], p)
			} else {
				const reactive = reactivity[key]
				if (reactive[path]) {
					reactive[path]()
					break
				}
			}
		}
	}

	elements.forEach((/** @type {any} */ element) => dive(element, parts))
}