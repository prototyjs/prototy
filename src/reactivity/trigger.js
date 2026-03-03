
/**
 * @param {any} cache
 * @param {string} path
 */
export function trigger(cache, path, parts) {

	const dive = (/** @type {any} */ c, /** @type {(string | number)[]} */ p) => {
		if (!c) return
		const arr = c.find(p)
		arr.forEach(item => {
			// if (p && reactivity.each?.[p.shift()]) {
			// 	const index = Number(p.shift())
			// 	dive(el.children[index]._cache, p)
			// } else {
			// 	e
			// }
			item.update()
		})
	}
	dive(cache, path)

}