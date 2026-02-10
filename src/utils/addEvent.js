/**
 * @param {HTMLElement} element
 * @param {string} key
 * @param {Function} handler
 */
export function addEvent(element, key, handler) {
	const [name, ...mods] = key.split('.')
	const options = {
		once: mods.includes('once'),
		capture: mods.includes('capture'),
		passive: mods.includes('passive')
	}

	const wrapper = (/** @type {any} */ event) => {
		if (mods.includes('stop')) event.stopPropagation()
		if (mods.includes('prevent')) event.preventDefault()
		if (mods.includes('self') && event.target !== element) return
		if (mods.includes('enter') && event.key !== 'Enter') return

		handler(event)
	}
	element.addEventListener(name, wrapper, options)
}