/**
 *
 */
export class Listeners {
	/**
	 *
	 */
	constructor() {
		this.#storage = new Map()
	}

	#storage

	/**
	 * @param {HTMLElement} element
	 * @param {string} attr
	 * @param {Function} fn
	 */
	add(element, attr, fn) {
		if (!this.#storage.has(element)) {
			this.#storage.set(element, [])
		}

		const [name, ...mods] = attr.split('.')
		const options = {
			once: mods.includes('once'),
			capture: mods.includes('capture'),
			passive: mods.includes('passive')
		}

		const handler = (/** @type {any} */ event) => {
			if (mods.includes('stop')) {
				event.stopPropagation()
			}
			if (mods.includes('prevent')) {
				event.preventDefault()
			}
			if (mods.includes('self') && event.target !== element) {
				return
			}
			if (mods.includes('enter') && event.key !== 'Enter') {
				return
			}

			fn(event)
		}

		const listener = { name, handler, options }
		this.#storage.get(element).push(listener)

		element.addEventListener(name, handler, options)
	}

	/**
	 * @param {HTMLElement} element
	 */
	remove(element) {
		const listeners = this.#storage.get(element)

		if (listeners) {
			listeners.forEach(({ name, handler, options }) => {
				element.removeEventListener(name, handler, options)
			})

			this.#storage.delete(element)
		}
	}
}