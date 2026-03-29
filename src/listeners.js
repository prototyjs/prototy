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
	 * @param { HTMLElement } element
	 * @param { string } attr
	 * @param { Function } handle
	 */
	add(element, attr, handle) {
		if (!this.#storage.has(element)) {
			this.#storage.set(element, [])
		}

		const [name, ...mods] = attr.split('.')
		const options = {
			once: mods.includes('once'),
			capture: mods.includes('capture'),
			passive: mods.includes('passive')
		}

		let handler = (event) => {
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
			handle(event)
		}

		if (name === 'create') {
			if (mods.includes('async')) {
				element._async = true
			}
			handler = async ( event ) => {
				const { detail, timestamp, done } = event
				const h = handle({ name: detail.name, target: element, timestamp  })
				element._async ? await h : h
				done()
			}
		}
		const listener = { name, handler, options }
		this.#storage.get(element).push(listener)
		element.addEventListener(name, handler, options)
	}

	/**
	 * @param { HTMLElement } element
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