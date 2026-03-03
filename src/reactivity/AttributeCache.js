export class AttributeCache {
	/**
	 * @param {HTMLElement} node
	 */
	constructor(node) {
		this.#storage = new Map()

		Object.defineProperty(node, '_cache', {
			value: this,
			enumerable: false,
			configurable: true
		})
	}

	#storage

	/**
	 * @param {HTMLElement} element
	 * @param {string} attr
	 * @param {string|number} key
	 * @param {Function} update
	 */
	add(element, attr, key, update) {
		if (!this.#storage.has(key)) {
			this.#storage.set(key, new Set())
		}

		this.#storage.get(key).add({
			element,
			attr,
			update
		})
	}

	/**
	 * @param {string|number} key
	 * @returns {Array<{el: HTMLElement, attr: string, update: Function}>}
	 */
	find(key) {
		const records = this.#storage.get(key)
		return records ? Array.from(records) : []
	}

	/**
	 * @param {HTMLElement} element
	 */
	remove(element) {
		for (const [key, records] of this.#storage.entries()) {
			for (const record of records) {
				if (record.element === element) {
					records.delete(record)
				}
			}

			if (records.size === 0) {
				this.#storage.delete(key)
			}
		}
	}

	clear() {
		this.#storage.clear()
	}

	/** @returns {number} */
	get size() {
		return this.#storage.size
	}
}