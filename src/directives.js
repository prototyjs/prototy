import innerDirectives from './directives/index'
import { bind } from './directives/bind'
import { attr } from './directives/attr'
import { each } from './directives/each'
import { component } from './directives/component.js'
import { property } from './directives/property'

/**
 * @class Directives
 */
export class Directives {
	/**
	 * @constructor
	 * @param { object } clientDirectives
	 * @param { object } bus
	 * @param { object } methods
	 */
	constructor(clientDirectives = {}, bus, methods) {
		/**
		 * @type {{ [key: string]: Function }}
		 */
		this.directives = {
			...clientDirectives,
			...innerDirectives,
			each: (element, value) => each(element, value, methods),
			component: (element, value) => component(element, value, methods),
			bind: (element, value, modifier, args, code) => bind(element, value, modifier, args, code, bus)
		}
	}
	/**
	 *
	 * @param { HTMLElement } element
	 * @param { string } key
	 * @param { any } value
	 * @param { string } code
	 */
	apply(element, key, value, code) {
		const [directive, modifier, ...args] = key.split('.')

		if (key === 'el') {
			return
		}
		if (Object.hasOwn(this.directives, directive)) {
			this.directives[directive](element, value, modifier, args, code, directive)
			return
		}
		if (directive in element) {
			property(element, value, modifier, args, directive)
			return
		}
		attr(element, value, modifier, args, directive)
	}
}