import innerDirectives from './directives/index'
import { bind } from './directives/bind'
import { attr } from './directives/attr'
import { each } from './directives/each'
import { context } from './directives/context'
import { component } from './directives/component.js'
import { property } from './directives/property'
import { Modifiers } from './directives/modifiers/modifiers'

/**
 * @class Directives
 */
export class Directives {
	/**
	 * @constructor
	 * @param { object } clientDirectives
	 * @param { Function } setup
	 * @param { object } bus
	 * @param { Modifiers } modifiers
	 */
	constructor(clientDirectives = {}, setup, bus, modifiers) {
		this.#contextStorage = new WeakMap()
		this.modifiers = modifiers
		/**
		 * @type {{ [key: string]: Function }}
		 */
		this.directives = {
			...clientDirectives,
			...innerDirectives,
			each: (element, value) => each(element, value, setup),
			context: (element, value, modifier) => context(element, value, modifier, this.#contextStorage),
			component: (element, value) => component(element, value, setup),
			bind: (element, value, modifier, args, code) => bind(element, value, modifier, args, code, bus)
		}
	}
	#contextStorage
	/**
	 *
	 * @param { HTMLElement } element
	 * @param { string } key
	 * @param { any } value
	 * @param { string } code
	 */
	apply(element, key, value, code) {
		if (key === 'el') {
			return
		}
		const [directive, modifier, ...args] = key.split('.') // ['text', 'fixed', '2', ...] // text.fixed.2

		if (Object.hasOwn(this.directives, directive)) {
			this.directives[directive](element, value, modifier, args, code, directive, this.modifiers)
			return
		}
		if (directive in element) {
			property(element, value, modifier, args, directive, this.modifiers)
			return
		}
		attr(element, value, modifier, args, directive, directive, this.modifiers)
	}
	/**
	 * @param { HTMLElement } element
	 * @returns { object }
	 */
	getContext(element) {
		let current = element
		while (current) {
			const ctx = this.#contextStorage.get(current)
			if (ctx) {
				return ctx
			}
			current = current.parentElement
		}
		return null
	}
}