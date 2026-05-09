/**
 *
 */
export class Reactivity {
	activeEffect = null
	#storage = new WeakMap()
	/**
	 * @param { object } target
	 * @param { string } key
	 * @param { Function } effect
	 */
	add(target, key, effect) {
		if (!this.#storage.has(target)) {
			this.#storage.set(target, new Map())
		}
		const keysMap = this.#storage.get(target)
		if (!keysMap.has(key)) {
			keysMap.set(key, new Set())
		}
		keysMap.get(key).add(effect)
	}
	/**
	 * @param { object } target
	 * @param { string } key
	 * @returns { Array<{el: HTMLElement, attr: string, update: Function}> }
	 */
	find(target, key) {
		const keysMap = this.#storage.get(target)
		const effects = keysMap?.get(key)
		return effects ? Array.from(effects) : []
	}
	/**
	 * @param {Function} effect
	 * @param {object} deps
	 */
	removeEffect(effect, deps) {
		if (!deps) {
			return
		}
		for (const dep of deps) {
			const { target, property } = dep
			const keysMap = this.#storage.get(target)
			if (keysMap) {
				const effects = keysMap.get(property)
				if (effects) {
					effects.delete(effect)
					if (effects.size === 0) {
						keysMap.delete(property)
					}
				}
				if (keysMap.size === 0) {
					this.#storage.delete(target)
				}
			}
		}
		deps.clear()
	}
	/**
	 * @param {HTMLElement} element
	 */
	removeEffects(element) {
		if (!element._effects) {
			return
		}
		for (const effect of element._effects) {
			this.removeEffect(effect, effect.deps)
		}
		element._effects.clear()
	}
}