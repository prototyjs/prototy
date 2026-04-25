import { isObject } from '@/utils/isObject'
import { unbind } from '@/utils/unbind'
import { dynamicFunction } from '@/utils/dynamicFunction'
import { mapComponents } from '@/component/mapComponents'
import { Directives } from '@/directives'
import { Reactivity } from '@/reactivity'
import { Listeners } from '@/listeners'
import { Nodes } from '@/nodes'
import { bindMethods } from '@/utils/bindMethods'
import { log } from '@/log'

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
				unbind(element)
				if (element._el) {
					if (this.bus.els[element._el] === element) {
						delete this.bus.els[element._el]
					}
				}
			},
			attribute: (/** @type { HTMLElement } */ element, /** @type { string } */ key, /** @type { string } */ value) => {
				if (key === 'el') {
					const name = value
					element._el = name
					this.bus.els[name] = element
				}
				if (key === ':each') {
					const hasContent = element.firstElementChild || element.textContent.trim() !== ''
					if (hasContent) {
						log.error('Content (slots) is not allowed inside the :each directive.', element)
					}
				}
				if (key === ':component') {
					if (element._slots) {
						return
					}
					element._slots = {}
					Array.from(element.childNodes).forEach(node => {
						if (node.nodeType === 3 && !node.textContent.trim()) {
							node.remove()
							return
						}
						const name = (node.nodeType === 1 && node.getAttribute('slot')) || 'default'
						if (element._slots[name]) {
							log.error('Slot "{0}" is already occupied in component', name, element)
							return
						}
						node._keep = true
						element._slots[name] = node
						node.remove()
					})
				}
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
					this.directive.apply(element, key, res, code)
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

			    const isArray = Array.isArray(target)
			    const oldValue = Reflect.get(target, property)

			    const isLength = isArray && property === 'length'

			    if (!isLength && Object.is(oldValue, value)) {
				    return true
			    }

			    const fullPath = path ? `${path}.${property.toString()}` : property.toString()
			    let newValue = value

			    if (isObject(value) && !value[IS_PROXY]) {
					newValue = self.createProxy(value, fullPath)
			    }

			    if (typeof self.setters?.[fullPath] === 'function' && !self.activeSetters.has(fullPath)) {
				    self.activeSetters.add(fullPath)
				    try {
					    newValue = self.setters[fullPath](newValue, oldValue)
					    if (Object.is(oldValue, newValue)) {
							return true
					    }
				    } finally {
					    self.activeSetters.delete(fullPath)
				    }
			    }

			    const success = Reflect.set(target, property, newValue, receiver)

			    if (success) {

				    self.schedule(target, property)

				    if (isArray && !isLength) {
					    self.schedule(target, 'length')
				    }
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

				const uniqueEffects = new Set()
				changedKeys.forEach(key => {
					const effects = this.reactivity.find(target, key)
					effects.forEach(eff => uniqueEffects.add(eff))
				})

				console.log('[Trigger] Target:', target, `Key: ${Array.from(changedKeys)}, Found effects: ${uniqueEffects.size}`)
				uniqueEffects.forEach(update => {
					if (update !== this.activeEffect) {
						update()
					}
				})
			})
		}
		this.pendingTargets.get(target).add(property)
	}
}
export { Prototy }