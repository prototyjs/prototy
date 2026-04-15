import innerDirectives from './methods/index.js'
import { bind } from './methods/bind.js'
import { attr } from './methods/attr.js'
import { each } from './methods/each.js'
import { context } from './methods/context.js'
import { component } from './methods/component.js'

/**
 * @class Directives
 */
export class Directives {
	/**
	 * @constructor
	 * @param { object } clientDirectives
	 * @param { Function } setup
	 * @param { object } bus
	 */
	constructor(clientDirectives = {}, setup, bus) {
		this.#contextStorage = new WeakMap()
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

		if (Object.hasOwn(this.directives,directive)) {
			this.directives[directive](element, value, modifier, args, code)
		} else if (directive in element) {
			element[directive] = value
		} else {
			attr(element, value, modifier, args, directive)
		}
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