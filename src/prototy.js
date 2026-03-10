// @ts-nocheck
import { findElements } from './utils/findElements'
import { isObject } from './utils/isObject'
import { isEqual } from './utils/isEqual'
import { createDynamicFunction } from './utils/createDynamicFunction'
import Directives from './directives/directives'
import { AttributeCache } from './reactivity/AttributeCache'
// import { addEvent } from './utils/addEvent'
import { trigger } from './reactivity/trigger'

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
	  constructor(options = {
		state: {},
		root: document.body,
		static: {},
		handles: {},
		directives: {}
	}) {
	    this.root = options.root
	    this.directive = new Directives(options.directives, this.setup.bind(this))
	
	    /** @type {object} */
	    this._state = options.state
	
	    /** @type {object} */
	    this.static = options.static
	    this.state = this.createProxy(options.state)
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

		// eslint-disable-next-line sonarjs/constructor-for-side-effects
		new AttributeCache(node)

		findElements(node, (/** @type {HTMLElement} */  element, /** @type {string} */ key, /** @type {string} */ code) => {
			const func = createDynamicFunction(code, this.bus, 'item')

			const update = () => {
				const res = func(item)
				this.directive.apply(element, key, res)
			}
			this.delayedAddToCache = (path) => node._cache.add(element, key, path, update.bind(this))

			this.activeEffect = update
			update()
			this.activeEffect = null

		}, (/** @type {HTMLElement} */ element, /** @type {string} */ key, /** @type {string} */ code) => {
			const func = createDynamicFunction(code, this.bus, 'event')
			element['on' + key] = func
			// addEvent(element, key, (/** @type {any} */ event) => func(event))
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
	
	        const value = Reflect.get(t, property, receiver)
	
	        return value
	      },
	      set(target, property, value) {
	        if (typeof property === 'symbol') {
	          return Reflect.set(target, property, value)
	        }
	        /** @type {Record<string | symbol, any>} */
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
	          const parts = fullPath.split('.')
	          if (
	            Array.isArray(target) &&
	            (/^\d+$/.test(property) || property === 'length')
	          ) {
						if (!self.pendingPaths.has(path)) {
							self.pendingPaths.add(path)
							queueMicrotask(() => {
								// eslint-disable-next-line no-console
								console.log(path)
								trigger(self.root._cache, path)
								self.pendingPaths.delete(path)
							})
						}
					} else if (parts.length >= 3 && (/^\d+$/.test(parts[parts.length - 2]))) {
						
						// eslint-disable-next-line no-console
						console.log(fullPath)
						trigger(self.root._cache, fullPath, parts)
					} else {
						// eslint-disable-next-line no-console
						console.log(fullPath)
						trigger(self.root._cache, fullPath)
					}
				}
				return success
			}
		})
	}
}
export default Prototy