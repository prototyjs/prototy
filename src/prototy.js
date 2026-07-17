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
import { priority } from '@/utils/priority'
import { kebabToCamel } from '@/utils/kebabToCamel'
import { log } from '@/log'
import { prepareElement } from '@/component/prepareElement'
import { bindAdvanced } from '@/directives/bindAdvanced.js'

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
 * @property { object } elements
 * @property { Record<string, Function> } setters
 * @property { Function } created
 * @property { Function } ready
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
		elements = {},
		components = {},
		setters = {},
		created,
		ready
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
			listeners: (/** @type { HTMLElement } */ element, /** @type { string } */ key, /** @type { string } */ value, /** @type { object } */ component) => {
				const func = dynamicFunction(value, component.bus, component.els, 'event')
				this.listeners.add(element, key, (event) => {
					const ctx = this.getContext(element)
					return func(element, ctx, event)
				})
			},
			destroy: this.destroy.bind(this),
			attribute: (/** @type { HTMLElement } */ element, /** @type { string } */ key, /** @type { string } */ value, /** @type { object } */ component) => {
				if (key.startsWith(':')) {
					const cleanKey = key.slice(1)
					prepareElement(element, cleanKey)
				}
				if (key === 'el') {
					const camelName = kebabToCamel(value)
					element._el = camelName
					component.els[camelName] = element
					this.functionality(element, component.elements?.[camelName], component)
				}
				if (key === 'component') {
					this.bus.components[value] = { name: value, template: element.tagName === 'TEMPLATE' ? element.innerHTML.trim() : element.outerHTML, element }
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
		created?.call(this.bus)
		this.setup(root, { bus: this.bus, els: this.bus.els, elements })
		ready?.call(this.bus)
	}
	/**
	 * @param { HTMLElement } element
	 * @param { object } directives
	 * @param { object } component
	 */
	functionality(element, directives, component) {
		if (!directives) {
			return
		}

		const ctx = this.getContext(element, true)
		const sortedKeys = Object.keys(directives).sort((a, b) => {
			return priority(a) - priority(b)
		})

		for (const key of sortedKeys) {
			const fn = directives[key]
			if (typeof fn !== 'function') {
				continue
			}

			prepareElement(element, key, directives)

			const args = {
				el: element,
				els: component.els,
				props: ctx
			}

			if (key === 'props') {
				const updateProps = () => {
					this.reactivity.removeEffect(updateProps, updateProps.deps)
					this.reactivity.activeEffect = updateProps
					try {
						const freshCtx = this.getContext(element, true)
						const freshArgs = {
							el: element,
							els: component.els,
							props: freshCtx
						}
						const result = fn.call(component.bus, freshArgs)
						this.updateContext(element, result)
					} catch {
						log.error('Error applying props in elements', key, element)
					} finally {
						this.reactivity.activeEffect = null
					}
				}

				updateProps.deps = new Set()
				updateProps()

				if (!element._effects) {
					element._effects = new Set()
				}
				element._effects.add(updateProps)
				continue
			}

			if (key.startsWith('on')) {
				const eventName = key.slice(2)
				this.listeners.add(element, eventName, (event) => {
					try {
						fn.call(component.bus, { ...args, event })
					} catch {
						log.error('Error in event handler', key, element)
					}
				})
				continue
			}

			const update = () => {
				this.reactivity.removeEffect(update, update.deps)
				this.reactivity.activeEffect = update
				try {
					const freshCtx = this.getContext(element, true)
					const freshArgs = {
						el: element,
						els: component.els,
						props: freshCtx
					}
					const result = fn.call(component.bus, freshArgs)
					if (result && typeof result === 'object' && 'get' in result && 'set' in result) {
						bindAdvanced(element, key, result, freshArgs, this.directive.api.transform)
					} else {
						this.directive.apply(element, key, result, result)
					}
				} finally {
					this.reactivity.activeEffect = null
				}
			}

			update.deps = new Set()
			update()

			if (!element._effects) {
				element._effects = new Set()
			}
			element._effects.add(update)

			if (!element._applied) {
				element._applied = new Set()
			}
			element._applied.add(key.split('.')[0])
		}
	}
	/**
	 * @param { HTMLElement } node
	 * @param { object } component
	 */
	setup(node, component) {
		this.nodes.process(node, component, (/** @type {HTMLElement} */  element, /** @type {string} */ key, /** @type {string} */ code) => {
			if (element._applied && element._applied.has(key.split('.')[0])) {
				log.warn('Directive "{0}" on element "{1}" is already defined in elements. HTML directive will be ignored.', key, element._el)
				return
			}
			const func = dynamicFunction(code, component.bus, component.els)
			const update = () => {
				this.reactivity.removeEffect(update, update.deps)
				this.reactivity.activeEffect = update
				try {
					const ctx= this.getContext(element)
					const res = func(element, ctx)
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
		Object.defineProperty(state, '_lastSegment', {
			value: path ? path.split('.').pop() : null,
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
			const parentProperty = current._lastSegment
			if (parentProperty) {
				addToPending(current._parent, parentProperty)
			}
			current = current._parent
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
	 * @param { object } els
	 */
	destroy(element, els = null) {
		if (element._el && els) {
			delete els[element._el]
		}
		for (const child of Array.from(element.children)) {
			this.destroy(child, element.els || null)
		}
		this.listeners.remove(element)
		this.reactivity.removeEffects(element)
		unbind(element)
		if (element.els) {
			element.els = {}
		}
	}
}
export { Prototy }