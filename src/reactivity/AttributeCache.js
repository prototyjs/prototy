export class AttributeCache {
	/**
	 * @param {object} root
	 */
	constructor(root) {
		this.#storage = new Map()

		Object.defineProperty(root, '_cache', {
			value: this,
			enumerable: false,
			configurable: true
		})
	}

	#storage

	/**
	 * @param {HTMLElement} element
	 * @param {string} attrName
	 * @param {string|number} key
	 * @param {*} value
	 */
	add(element, attrName, key, value) {
		if (!this.#storage.has(key)) {
			this.#storage.set(key, new Set())
		}

		this.#storage.get(key).add({
			element,
			attr: attrName,
			val: String(value)
		})
	}

	/**
	 * @param {string|number} key
	 * @returns {Array<{el: HTMLElement, attr: string, val: string}>}
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