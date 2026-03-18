import { isObject } from './utils/isObject'
import { isEqual } from './utils/isEqual'
import { createDynamicFunction } from './utils/createDynamicFunction'
import { Directives } from './directives/directives.js'
import { Reactivity } from '@/reactivity.js'
import { Listeners } from '@/listeners.js'
import { Nodes } from '@/nodes.js'

/**
 * @typedef { object } PrototyOptions
 * @property { object } state
 * @property { HTMLElement } root
 * @property { object } static
 * @property { Record<string, Function> } handles
 * @property { object } directives
 */
class Prototy {
	/**
	 * @param {PrototyOptions} options
	 */
	constructor(options = { state: {}, root: document.body, static: {}, handles: {}, directives: {}, components: {} }) {
		this.root = options.root
		this.state = this.createProxy(options.state)

		/** @type {Record<string, Function>} */
		this.handles = {}
		this.pendingPaths = new Set()

		this.directive = new Directives(options.directives, this.setup.bind(this))
		this.reactivity = new Reactivity()
		this.listeners = new Listeners()
		this.nodes = new Nodes({
			root: this.root,
			fnListener: (/** @type { HTMLElement } */ node, /** @type { string } */ key, /** @type { string } */ code) => {
				const context = this.directive.getContext(node)
				const func = createDynamicFunction(code, this.bus, context, 'event')
				this.listeners.add(node, key, func)
			},
			fnRemove: (/** @type { HTMLElement } */ node) => {
				this.listeners.remove(node)
				this.reactivity.remove(node)
				// event remove node
			}
		})

		if (options.handles) {
		  Object.keys(options.handles).forEach((key) => {
		    if (typeof options.handles[key] === 'function') {
		      this.handles[key] = options.handles[key].bind(this)
		    }
		  })
		}

	  this.bus = {
		  state: this.state,
		  handles: this.handles,
		  static: options.static,
		  components: options.components
	  }
	  this.setup(this.root)
	}
	/**
	 * @param { HTMLElement } node
	 * @param { object } item
	 */
	setup(node, item) {
		this.nodes.process(node, (/** @type {HTMLElement} */  element, /** @type {string} */ key, /** @type {string} */ code) => {
			const context = this.directive.getContext(element)
			const func = createDynamicFunction(code, this.bus, context, 'item')

			const update = () => {
				const res = func(item)
				this.directive.apply(element, key, res)
			}
			this.delayedAddToCache = (path) => this.reactivity.add(element, key, path, update.bind(this))

			this.activeEffect = update
			update()
			this.activeEffect = null
		})
	}
	/**
	 * @param { any } state
	 * @param { string } path
	 * @returns { object }
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
		    getPrototypeOf(target) {
			    return { target, instance: 'Proxy' }
		    },
	      get(target, property, receiver) {
	        const value = Reflect.get(target, property, receiver)
		      const isObservable = typeof property !== 'symbol' &&
			      (property in target) &&
			      typeof value !== 'function'

		      if (isObservable && self.activeEffect) {
			      const fullPath = path
				      ? `${path}.${property.toString()}`
				      : property.toString()
			      self.delayedAddToCache(fullPath)
		      }
	        return value
	      },
		    set(target, property, value, receiver) {
			    if (typeof property === 'symbol') {
				    return Reflect.set(target, property, value, receiver)
			    }
			    const t = target
			    const oldValue = Reflect.get(t, property)

			    const fullPath = path
				    ? `${path}.${property.toString()}`
				    : property.toString()
			    console.log(fullPath)
			    let newValue = value

			    if (isObject(value) && value.instance !== 'Proxy') {
				    newValue = self.createProxy(value, fullPath)
			    }

			    const success = Reflect.set(t, property, newValue, receiver)

			    if (success) {
				    const isLength = property === 'length' && Array.isArray(target)
				    const hasChanged = !isEqual(oldValue, newValue)

				    if (isLength || hasChanged) {
					    const isArrayIndex = Array.isArray(target) && /^\d+$/.test(property)

					    if ((isArrayIndex || isLength) && !self.pendingPaths.has(path)) {
						    self.pendingPaths.add(path)
						    queueMicrotask(() => {
							    self.trigger(path)
							    self.pendingPaths.delete(path)
						    })
					    } else if (!isLength && !isArrayIndex) {
						    self.trigger(fullPath)
					    }
				    }
			    }
			    return success
		    }
		})
	}
	/**
	 * @param { string|number } path
	 */
	trigger(path) {
		const arr = this.reactivity.find(path)
		console.log(path)
		arr.forEach(item => item.update())
	}
}
export default Prototy