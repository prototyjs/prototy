/**
 * @param {HTMLElement} element
 * @param {boolean} value
 * @param {object} storage
 * @param {string} modifier
 */
export function context(element, value, storage, modifier) {
	let parentContext = null
	let parent = element.parentElement
	while (parent) {
		if (storage.has(parent)) {
			parentContext = storage.get(parent)
			break
		}
		parent = parent.parentElement
	}

	let newContext

	if (modifier ==='scope') {
		newContext = { ...value }
	} else {
		newContext = { ...parentContext, ...value }
	}

	storage.set(element, newContext)
}