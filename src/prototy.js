import { findElements } from './utils/findElements'
import { isObject } from './utils/isObject'
import { isEqual } from './utils/isEqual'
import { createDynamicFunction } from './utils/createDynamicFunction'
import Directives from './directives/Directives'
import { Reactivity } from '@/reactivity.js'
import { Listeners } from '@/listeners.js'

/**
 * @typedef {object} PrototyOptions
 * @property {object} state
 * @property {HTMLElement} root
 * @property {object} static
 * @property {Record<string, Function>} handles
 * @property {object} directives
 */
class Prototy {
	/**
	 * @param {PrototyOptions} options
	 */
	constructor(options = { state: {}, root: document.body, static: {}, handles: {}, directives: {} }) {
		this.root = options.root
		this.static = options.static
		this.state = this.createProxy(options.state)
		this.directive = new Directives(options.directives, this.setup.bind(this))
		this.reactivity = new Reactivity()
		this.listeners = new Listeners()
		/** @type {Record<string, Function>} */
		this.handles = {}
		this.pendingPaths = new Set()
	  this.delayedAddToCache = () => {}

		if (options.handles) {
		  Object.keys(options.handles).forEach((key) => {
		    if (typeof options.handles[key] === 'function') {
		      this.handles[key] = options.handles[key].bind(this)
		    }
		  })
		}

	  this.bus = {
		  state: this.state,
		  static: this.static,
		  handles: this.handles
	  }
	  document.addEventListener('DOMContentLoaded', () => this.setup(this.root))
	}

	/**
	 * @param {HTMLElement} node
	 * @param {object} item
	 */
	setup(node, item) {
		findElements(node, (/** @type {HTMLElement} */  element, /** @type {string} */ key, /** @type {string} */ code) => {
			const func = createDynamicFunction(code, this.bus, 'item')

			const update = () => {
				const res = func(item)
				this.directive.apply(element, key, res)
			}
			this.delayedAddToCache = (path) => this.reactivity.add(element, key, path, update.bind(this))

			this.activeEffect = update
			update()
			this.activeEffect = null

		}, (/** @type {HTMLElement} */ element, /** @type {string} */ key, /** @type {string} */ code) => {
			const func = createDynamicFunction(code, this.bus, 'event')
			this.listeners.add(element, key, func)
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
	      Object.keys(state).forEach((key) => {
	        if (isObject(state[key])) {
	          state[key] = this.createProxy(
	            state[key],
	            path ? `${path}.${key}` : key
	          )
	        }
	      })
	    }

	    return new Proxy(state, {
	      get(target, property, receiver) {
	        /** @type {Record<string | symbol, any>} */
	        const t = target

	        const fullPath = path
	          ? `${path}.${property.toString()}`
	          : property.toString()

	        if (self.activeEffect) {
		        self.delayedAddToCache(fullPath)
	        }
	        return Reflect.get(t, property, receiver)
	      },
		    set(target, property, value) {
			    if (typeof property === 'symbol') {
				    return Reflect.set(target, property, value)
			    }

			    const t = target
			    const oldValue = Reflect.get(t, property)
			    const fullPath = path
				    ? `${path}.${property.toString()}`
				    : property.toString()

			    let newValue = value
			    if (isObject(value)) {
				    newValue = self.createProxy(value, fullPath)
			    }

			    const success = Reflect.set(t, property, newValue)

			    if (success && !isEqual(oldValue, newValue)) {
				    const isArrayIndex = Array.isArray(target) && (/^\d+$/.test(property) || property === 'length')

				    if (isArrayIndex && !self.pendingPaths.has(path)) {
					    self.pendingPaths.add(path)
					    queueMicrotask(() => {
						    self.trigger(fullPath)
						    self.pendingPaths.delete(path)
					    })
				    } else {
					    self.trigger(fullPath)
				    }
			    }
			    return success
		    }
		})
	}
	/**
	 * @param {string|number} path
	 */
	trigger(path) {
		const arr = this.reactivity.find(path)
		arr.forEach(item => item.update())
	}
}
export default Prototy