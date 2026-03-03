import { findElements } from './utils/findElements'
import { isObject } from './utils/isObject'
import { isEqual } from './utils/isEqual'
import { updateValue } from './directives/directives'
import { addEvent } from './utils/addEvent'
import { trigger } from './reactivity/trigger'
import { each } from './directives/each.js'
import { AttributeCache } from './reactivity/AttributeCache.js'

/**
 * @typedef {object} PrototyOptions
 * @property {object} state
 * @property {HTMLElement} root
 * @property {object} static
 * @property {Record<string, Function>} handles
 */
class Prototy {
	/**
	 * @param {PrototyOptions} options
	 */
	constructor(options) {
		this.root = options.root || document.body

		/** @type {object} */
		this._state = options.state

		/** @type {object} */
		this.static = options.static
		this.state = this.createProxy(options.state)
		this.bus = {
			state: this.state
		}
		/** @type {Record<string, Function>} */
		this.handles = {}

		/** @type {Record<string, any>} */
		this.buf = {}
		this.pendingPaths = new Set()

		if (options.handles) {
			Object.keys(options.handles).forEach((key) => {
				if (typeof options.handles[key] === 'function') {
					this.handles[key] = options.handles[key].bind(this)
				}
			})
		}

		document.addEventListener('DOMContentLoaded', () => this.setup(this.bus, this.root))
	}

	/**
     * @param {any} code
     * @param {any} props
     */
	async compute(code, props) {
		try {
			const context = { ...this.bus, ...props }
			const keys = Object.keys(context)
			const values = Object.values(context)

			const f = new Function(...keys, `return (async () => { ${code} })()`)
			return await f(...values)
		} catch (error) {
			console.error('Error in compute function:', error)
			return null
		}
	}
	/**
	 * @param {HTMLElement} node
	 * @param {Object} item
	 */
	setup(node, item) {

		new AttributeCache(node)

		node._elements = findElements(node, (/** @type {any} */  element, /** @type {string} */ key,/** @type {object} */ reactivity, /** @type {string} */ code) => {
			// eslint-disable-next-line sonarjs/code-eval
			const func = new Function('state', 'item', `return ${code}`)
			this.buf = reactivity

			this.autorun(() => {
				const res = func(this.bus.state, item)
				if (key === 'each') { // .reverse, .sort, .first(n) / .last(n), .empty?
					each(res, element, this.setup.bind(this))
				} else {
					updateValue(element, key, res)
				}
			})
		}, (/** @type {any} */ element, /** @type {string} */ key, /** @type {string} */ code) => {
			addEvent(element, key, (/** @type {any} */ event) => this.compute(code, { event }))
		})
	}
	/**
	 * @param {any} state
	 * @param {string} path
	 * @returns {object}
	 */
	createProxy(state, path = '') {
		const self = this

		if (isObject(state)) {
			Object.keys(state).forEach(key => {
				if (isObject(state[key])) {
					state[key] = this.createProxy(state[key], path ? `${path}.${key}` : key)
				}
			})
		}

		return new Proxy(state, {
			get(target, property, receiver) {
				/** @type {Record<string | symbol, any>} */
				const t = target

				const fullPath = path ? `${path}.${property.toString()}` : property.toString()

				if (self.activeEffect) {
					self.buf[fullPath] = self.activeEffect
				}

				const value = Reflect.get(t, property, receiver)

				return value
			},
			set(target, property, value) {
				/** @type {Record<string | symbol, any>} */
				const t = target
				const oldValue = Reflect.get(t, property)
				const fullPath = path ? `${path}.${property.toString()}` : property.toString()

				let newValue = value
				if (isObject(value)) {
					newValue = self.createProxy(value, fullPath)
				}
				const success = Reflect.set(t, property, newValue)

				if (success && !isEqual(oldValue, newValue)) {
					const parts = fullPath.split('.')
					if (Array.isArray(target) && (/^\d+$/.test(property) || property === 'length')) { // check symbol

						if (!self.pendingPaths.has(path)) {
							self.pendingPaths.add(path)
							queueMicrotask(() => {
								console.log(path)
								trigger(self.root._cache, path)
								self.pendingPaths.delete(path)
							})
						}
					} else if (parts.length >= 3 && (/^\d+$/.test(parts[parts.length - 2]))) {
						// upd item prop
						console.log(fullPath)
						trigger(self.root._cache, fullPath, parts)
					} else {
						console.log(fullPath)
						trigger(self.root._cache, fullPath)
					}
				}
				return success
			}
		})
	}
	/**
	 * @param {Function} fn
	 */
	autorun(fn) {
		this.activeEffect = fn
		fn()
		this.activeEffect = null
	}
}
export default Prototy