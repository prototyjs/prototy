import { findElements } from './utils/findElements.js'
import { isObject } from './utils/isObject.js'
import { isEqual } from './utils/isEqual.js'
//import { updateValue } from './directives/directives.js'
import { addEvent } from './utils/addEvent.js'
import Directives from './directives/directives.js'
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

		/** @type {Record<string, any>} */
		this.reactivity = {}

		if (options.handles) {
			Object.keys(options.handles).forEach((key) => {
				if (typeof options.handles[key] === 'function') {
					this.handles[key] = options.handles[key].bind(this)
				}
			})
		}

		document.addEventListener('DOMContentLoaded', () => {
			this.elements = findElements(document, (element, key,/** @type {object} */ reactivity, /** @type {string} */ code) => {
				// eslint-disable-next-line sonarjs/code-eval
				const func = new Function('state', `return ${code}`)
				this.reactivity = reactivity
				this.autorun(() => {
					const value = func(this.state)
					const [directive, modifier, ...args] = key.split('.')
					if (directive === 'each') { // .reverse, .sort, .first(n) / .last(n), .empty?

					} else {

						let directives = new Directives(this)
						directives.updateValue(element, key, value)
					}
				})
			}, (element, key, code) => {
				const func = new Function('state', 'event', `${code}`)
				const [name, ...mods] = key.split('.')
				addEvent(element, name, (/** @type {any} */ event) => func(this.state, event), mods)
			})
			console.log(this.elements)
			console.log(this)
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
					self.reactivity[fullPath] = self.activeEffect
				}

				const value = Reflect.get(t, property, receiver)
				//
				// if (isObject(value)) {
				// 	return self.createProxy(value, fullPath)
				// }
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
					self.trigger.bind(self)(fullPath)
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
		this.elements?.forEach(element => {
			const reactivity = element._reactivity
			if (!reactivity) return

			for (const key in reactivity) {
				const reactive = reactivity[key]
				if (reactive[path]) {
					reactive[path]()
					break
				}
			}
		})

	}

}
export default Prototy