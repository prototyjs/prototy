import { isObject } from '@/utils/isObject'
import { unbind } from '@/utils/unbind'
import { dynamicFunction } from '@/utils/dynamicFunction'
import { mapComponents } from '@/component/mapComponents'
import { Directives } from '@/directives'
import { Modifiers } from '@/modifiers'
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
 * @property { Record<string, Function> } directives
 * @property { Record<string, Function> } modifiers
 * @property { object } components
 * @property { Record<string, Function> } setters
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
		computed = {},
		directives = {},
		modifiers = {},
		components = {},
		setters = {}
	}) {
		this.reactivity = new Reactivity()
		this.listeners = new Listeners()
		this.contextStorage = new WeakMap()
		this.pendingTargets = new Map()

		this.initComputed(state, computed)
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

		this.nodes = new Nodes({
			listeners: (/** @type { HTMLElement } */ element, /** @type { string } */ key, /** @type { string } */ value) => {
				const func = dynamicFunction(value, this.bus, 'event')
				this.listeners.add(element, key, (event) => {
					const context = this.getContext(element)
					return func(element, context, event)
				})
			},
			destroy: this.destroy.bind(this),
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
		this.modifiers = new Modifiers(modifiers)
		this.directive = new Directives(directives, this.bus, {
			setup: this.setup.bind(this),
			unprocess: this.nodes.unprocess.bind(this.nodes),
			context: this.updateContext.bind(this),
			transform: this.modifiers.transform.bind(this.modifiers)
		})

		this.setup(root)
	}
	/**
	 * @param { HTMLElement } node
	 */
	setup(node) {
		this.nodes.process(node, (/** @type {HTMLElement} */  element, /** @type {string} */ key, /** @type {string} */ code) => {
			const func = dynamicFunction(code, this.bus)
			const update = () => {
				this.reactivity.removeEffect(update, update.deps)
				this.reactivity.activeEffect = update
				try {
					const context = this.getContext(element)
					const res = func(element, context)
					if (key === 'props') {
						this.updateContext(element, res)
					} else {
						this.directive.apply(element, key, res, code)
					}
				} finally {
					this.reactivity.activeEffect = null
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
	 * @param { object } rawState
	 * @param { Record<string, Function> } computed
	 */
	initComputed(rawState, computed) {
		if (!computed || Object.keys(computed).length === 0) {
			return
		}

		Object.keys(computed).forEach(key => {
			if (key in rawState) {
				log.warn('Computed property "{0}" overrides existing property', key)
			}

			const getter = computed[key]
			let cachedValue
			let isDirty = true

			const computedEffect = () => {
				if (!isDirty) {
					isDirty = true
					this.schedule(rawState, key)
				}
			}
			computedEffect.deps = new Set()

			Object.defineProperty(rawState, key, {
				get: () => {
					if (this.reactivity.activeEffect === computedEffect) {
						log.error('Circular dependency detected in computed property "{0}"', key)
						return cachedValue
					}

					const activeEffect = this.reactivity.activeEffect
					if (activeEffect && activeEffect !== computedEffect) {
						this.reactivity.add(rawState, key, activeEffect)
						activeEffect.deps.add({ target: rawState, property: key })
					}

					if (isDirty) {
						const prevEffect = this.reactivity.activeEffect

						if (computedEffect.deps.size > 0) {
							this.reactivity.removeEffect(computedEffect, computedEffect.deps)
							computedEffect.deps.clear()
						}

						this.reactivity.activeEffect = computedEffect

						try {
							cachedValue = getter.bind(this.bus)()
						} catch (e) {
							log.error('Error in computed property "{0}": {1}', key, e.message)
							cachedValue = undefined
						} finally {
							this.reactivity.activeEffect = prevEffect
						}
						isDirty = false
					}

					return cachedValue
				},
				enumerable: true,
				configurable: true
			})
		})
	}
	/**
	 * @param { any } state
	 * @param { string } path
	 * @param { string } parent
	 * @returns { object }
	 */
	createProxy(state, path = '', parent= null) {
		const self = this

		if (isObject(state)) {
	      Object.keys(state).forEach((key) => {
		      const descriptor = Object.getOwnPropertyDescriptor(state, key)
		      if (descriptor && typeof descriptor.get === 'function') {
			      return
		      }
	        if (isObject(state[key])) {
	          state[key] = this.createProxy(
	            state[key],
	            path ? `${path}.${key}` : key,
		          state
	          )
	        }
	      })
	    }
		if (path) {
    	Object.defineProperty(state, '_path', {
        	value: path,
        	enumerable: false,
        	writable: true,
        	configurable: true
    	})
			Object.defineProperty(state, '_parent', {
				value: parent,
				enumerable: false,
				writable: true,
				configurable: true
			})
		}
		Object.defineProperty(state, IS_PROXY, {
    		value: true,
    		enumerable: false,
    		writable: false,
    		configurable: false
		})

		return new Proxy(state, {
			get(target, property, receiver) {
	      if (property === IS_PROXY) {
		      return true
	      }
				const value = Reflect.get(target, property, receiver)

	      const isObservable = typeof property !== 'symbol' &&
		      (property in target) &&
		      typeof value !== 'function'

	      const activeEffect = self.reactivity.activeEffect
	      if (isObservable && activeEffect) {
		      self.reactivity.add(target, property, activeEffect)
		      activeEffect.deps.add({ target, property })
	      }
				return value
			},
			// eslint-disable-next-line sonarjs/cognitive-complexity
	    set(target, property, value, receiver) {
		    if (typeof property === 'symbol') {
			    return Reflect.set(target, property, value, receiver)
		    }
		    const descriptor = Object.getOwnPropertyDescriptor(target, property)
		    if (descriptor && typeof descriptor.get === 'function' && typeof descriptor.set !== 'function') {
			    log.error('Computed property "{0}" is readonly.', property.toString())
			    return false
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
			    } catch (e) {
				    log.error('Error in setter for "{0}": {1}', fullPath, e.message)
				    newValue = oldValue
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
		const addToPending = (obj, prop) => {
			if (!this.pendingTargets.has(obj)) {
				this.pendingTargets.set(obj, new Set())

				queueMicrotask(() => {
					const changedKeys = this.pendingTargets.get(obj)
					this.pendingTargets.delete(obj)

					const uniqueEffects = new Set()
					changedKeys.forEach(key => {
						const effects = this.reactivity.find(obj, key)
						// eslint-disable-next-line sonarjs/no-nested-functions
						effects.forEach(eff => uniqueEffects.add(eff))

						const value = obj[key]
						if (value && value._path) {
							const pathEffects = this.reactivity.find(obj, value._path)
							// eslint-disable-next-line sonarjs/no-nested-functions
							pathEffects.forEach(eff => uniqueEffects.add(eff))
						}
					})

					uniqueEffects.forEach(update => {
						if (update !== this.reactivity.activeEffect) {
							update()
						}
					})
				})
			}
			this.pendingTargets.get(obj).add(prop)
		}

		addToPending(target, property)

		let current = target
		while (current && current._parent) {
			const parentProperty = current._path ? current._path.split('.').pop() : null
			if (parentProperty) {
				addToPending(current._parent, parentProperty)
			}
			current = current._parent
		}
	}
	/**
	 * @param { string } path
	 * @param { any } value
	 */
	update(path, value) {
		if (typeof path !== 'string') {
			log.error('update() expects path to be a string, but received {0}', typeof path)
			return
		}
		const segments = path.split('.')
		const lastKey = segments.pop()
		const target = segments.reduce((acc, k) => acc?.[k], this.state)
		if (!target || typeof target !== 'object') {
			log.error('Update error: path "{0}" is unreachable', path)
			return
		}
		const setter = this.setters[path]
		const oldValue = target[lastKey]
		if (typeof setter === 'function') {
			this.activeSetters.add(path)
			try {
				target[lastKey] = setter(value, oldValue, 'external')
			} finally {
				this.activeSetters.delete(path)
			}
		} else {
			if (oldValue !== value) {
				target[lastKey] = value
			}
		}
	}
	/**
	 * @param { HTMLElement } element
	 * @param { boolean } reactive
	 * @returns { any }
	 */
	getContext(element, reactive = true) {
		const self = this
		const activeEffect = reactive ? this.reactivity.activeEffect : null

		return new Proxy({}, {
			get(_, prop) {
				let current = element
				while (current) {
					const entry = self.contextStorage.get(current)
					if (entry?.data && prop in entry.data) {
						if (activeEffect) {
							const contextKey = `ctx:${String(prop)}`
							self.reactivity.add(current, contextKey, activeEffect)
							activeEffect.deps.add({ target: current, property: contextKey })
						}
						return entry.data[prop]
					}
					current = current.parentElement
				}
				return undefined
			},
			has: () => true
		})
	}
	/**
	 * @param { HTMLElement } element
	 * @param { any } newValue
	 */
	updateContext(element, newValue) {
		let entry = this.contextStorage.get(element)
		if (!entry) {
			entry = { data: {}, isScope: false }
			this.contextStorage.set(element, entry)
		}

		for (const key in newValue) {
			const val = newValue[key]
			const oldVal = entry.data[key]

			if (oldVal !== val) {
				entry.data[key] = val

				const contextKey = `ctx:${key}`
				const effects = this.reactivity.find(element, contextKey)

				effects.forEach(effect => {
					if (effect !== this.reactivity.activeEffect) {
						effect()
					}
				})
			}
		}
	}
	/**
	 * @param { HTMLElement } element
	 */
	destroy(element) {
		if (!element) {
			return
		}
		Array.from(element.children).forEach(child => {
			this.destroy(child)
		})
		this.listeners.remove(element)
		this.reactivity.removeEffects(element)
		unbind(element)
		if (element._el) {
			if (this.bus.els[element._el] === element) {
				delete this.bus.els[element._el]
			}
		}
	}
}
export { Prototy }