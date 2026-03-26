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
	 * @param { PrototyOptions } options
	 */
	constructor(options = { state: {}, root: document.body, static: {}, handles: {}, directives: {}, components: {} }) {
		this.root = options.root
		this.state = this.createProxy(options.state)

		/** @type {Record<string, Function>} */
		this.handles = {}
		this.pendingTargets = new Map()

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
				this.reactivity.removeElementEffects(node)
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
				this.reactivity.removeEffect(update, update.deps)
				this.activeEffect = update
				try {
					const res = func(item)
					this.directive.apply(element, key, res)
				} finally {
					this.activeEffect = null
				}
			}
			if (!element._effects) {
				element._effects = new Set()
			}
			element._effects.add(update)

			update.deps = new Set()
			update()
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
			      self.reactivity.add(target, property, self.activeEffect)
			      self.activeEffect.deps.add({ target, property })
		      }
	        return value
	      },
		    set(target, property, value, receiver) {
			    if (typeof property === 'symbol') {
				    return Reflect.set(target, property, value, receiver)
			    }

			    const oldValue = Reflect.get(target, property)
			    const fullPath = path ? `${path}.${property.toString()}` : property.toString()
			    let newValue = value

			    if (isObject(value) && value.instance !== 'Proxy') {
				    newValue = self.createProxy(value, fullPath)
			    }

			    const success = Reflect.set(target, property, newValue, receiver)

			    if (success) {
				    const hasChanged = !isEqual(oldValue, newValue)
				    const isArray = Array.isArray(target)

				    const isIndex = isArray && !isNaN(Number(property))
				    const isLength = isArray && property === 'length'

				    if (hasChanged || isLength) {
					    if (isIndex) {
						    return success
					    }

					    if (!self.pendingTargets.has(target)) {
						    self.pendingTargets.set(target, new Set())

						    queueMicrotask(() => {
							    const changedKeys = self.pendingTargets.get(target)
							    self.pendingTargets.delete(target)

							    changedKeys.forEach(key => {
								    self.trigger(target, key)
							    })
						    })
					    }
					    self.pendingTargets.get(target).add(property)
				    }
			    }
			    return success
		    }
		})
	}
	/**
	 * @param { object } target
	 * @param { string } key
	 */
	trigger(target, key) {
		const effects = this.reactivity.find(target, key)
		console.log('[Trigger] Target:', target, `Key: ${key}, Found effects: ${effects.length}`)
		effects.forEach(update => {
			if (update !== this.activeEffect) {
				update()
			}
		})
	}
}
export default Prototy