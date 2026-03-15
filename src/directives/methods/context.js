/**
 * @param {HTMLElement} element
 * @param {boolean} value
 * @param {object} storage
 */
export function context(element, value, storage) {
	let parentContext = null
	let parent = element.parentElement
	while (parent) {
		if (storage.has(parent)) {
			parentContext = storage.get(parent)
			break
		}
		parent = parent.parentElement
	}

	const mergedContext = { ...parentContext, ...value }

	storage.set(element, mergedContext)
}