import { findElements } from './utils/findElements.js'
import { isObject } from './utils/isObject.js'
import { isEqual } from './utils/isEqual.js'

/**
 * @typedef {object} PrototyOptions
 * @property {object} state
 * @property {object} static
 * @property {Record<string, Function>} handles
 */
class Prototy {
	/**
	 * @param {PrototyOptions} options
	 */
	constructor(options) {
		/** @type {object} */
		this._state = options.state

		/** @type {object} */
		this.static = options.static
		this.state = this.createProxy(options.state)

		/** @type {Record<string, Function>} */
		this.handles = {}

		/** @type {Record<string, Function>} */
		this.currentReactive = {}

		if (options.handles) {
			Object.keys(options.handles).forEach((key) => {
				if (typeof options.handles[key] === 'function') {
					this.handles[key] = options.handles[key].bind(this)
				}
			})
		}

		document.addEventListener('DOMContentLoaded', () => {
			this.elements = findElements(document, (/** @type {string} */ code) => {
				// eslint-disable-next-line sonarjs/code-eval
				const func = new Function('state', `return ${code}`)
				this.currentReactive = {}
				this.autorun(() => func(this.state))
				return this.currentReactive
			})
			this.currentReactive = {}
			console.log(this.elements)
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
					// self.track(fullPath)
					self.currentReactive[fullPath] = self.activeEffect
				}

				const value = Reflect.get(t, property, receiver)

				if (isObject(value)) {
					return self.createProxy(value, fullPath)
				}
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
					self.trigger(fullPath)
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
	/**
	 * @param {string} path
	 */
	trigger(path) {
		console.log(path)
		// this.listeners.forEach(fn => fn(path))
	}
}
export default Prototy