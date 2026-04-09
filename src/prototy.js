import { isObject } from '@/utils/isObject'
import { shouldTrigger } from '@/utils/shouldTrigger'
import { dynamicFunction } from '@/utils/dynamicFunction'
import { mapComponents } from '@/utils/mapComponents'
import { Directives } from '@/directives/directives'
import { Reactivity } from '@/reactivity'
import { Listeners } from '@/listeners'
import { Nodes } from '@/nodes'
import { bindMethods } from '@/utils/bindMethods'

const IS_PROXY = Symbol('is_proxy')
/**
 * @typedef { object } PrototyOptions
 * @property { object } state
 * @property { HTMLElement } root
 * @property { object } params
 * @property { Record<string, Function> } methods
 * @property { Record<string, Function> } setters
 * @property { object } directives
 */
class Prototy {
	/**
	 * @param { PrototyOptions } options
	 */
	constructor({
		state = {},
		root = document.body,
		params = {},
		methods = {},
		directives= {},
		components= {},
		setters= {}
	}) {
		this.pendingTargets = new Map()
		this.state = this.createProxy(state)

		this.methods = {}
		this.setters = {}
		this.activeSetters = new Set()

		this.bus = {
			root,
			state: this.state,
			methods: this.methods,
			params,
			components: mapComponents(components),
			els: {}
		}

		bindMethods(this.methods, methods, this.bus)
		bindMethods(this.setters, setters, this.bus)

		this.directive = new Directives(directives, this.setup.bind(this), this.bus)
		this.reactivity = new Reactivity()
		this.listeners = new Listeners()

		this.nodes = new Nodes({
			root,
			listeners: (/** @type { HTMLElement } */ element, /** @type { string } */ key, /** @type { string } */ value) => {
				const context = this.directive.getContext(element)
				const func = dynamicFunction(value, this.bus, context, 'event')
				this.listeners.add(element, key, (...arg) => func(element, ...arg))
			},
			removed: (/** @type { HTMLElement } */ element) => {
				this.listeners.remove(element)
				this.reactivity.removeEffects(element)
			}
		})
	  this.setup(root)
	}
	/**
	 * @param { HTMLElement } node
	 * @param { object } item
	 */
	setup(node, item) {
		this.nodes.process(node, (/** @type {HTMLElement} */  element, /** @type {string} */ key, /** @type {string} */ code) => {
			const context = this.directive.getContext(element)
			const func = dynamicFunction(code, this.bus, context,  'item')
			const update = () => {
				this.reactivity.removeEffect(update, update.deps)
				this.activeEffect = update
				try {
					const res = func(element, item)
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
		      if (property === IS_PROXY) {
			      return true
		      }
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

			    if (isObject(value) && !value[IS_PROXY]) {
				    newValue = self.createProxy(value, fullPath)
			    }

			    if (self.activeSetters.has(fullPath)) {
				    return Reflect.set(target, property, newValue, receiver)
			    }

			    if (typeof self.setters?.[fullPath] === 'function') {
				    self.activeSetters.add(fullPath)
				    try {
					    newValue = self.setters[fullPath](newValue, oldValue)
				    } finally {
					    self.activeSetters.delete(fullPath)
				    }
			    }

			    const success = Reflect.set(target, property, newValue, receiver)

			    if (success && shouldTrigger(target, property, oldValue, newValue)) {
				    self.schedule(target, property)
			    }
			    return success
		    }
		})
	}
	/**
	 * @param { object } target
	 * @param { string } property
	 */
	schedule(target, property) {
		if (!this.pendingTargets.has(target)) {
			this.pendingTargets.set(target, new Set())

			queueMicrotask(() => {
				const changedKeys = this.pendingTargets.get(target)
				this.pendingTargets.delete(target)
				changedKeys.forEach(key => this.trigger(target, key))
			})
		}
		this.pendingTargets.get(target).add(property)
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
export { Prototy }