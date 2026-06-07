import innerDirectives from './directives/index'
import { bind } from './directives/bind'
import { attr } from './directives/attr'
import { each } from './directives/each'
import { component } from './directives/component'
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
		this.methods = methods
		/**
		 * @type {{ [key: string]: Function }}
		 */
		this.directives = {
			...clientDirectives,
			...innerDirectives,
			each: (element, value, modifier) => each(element, value, methods, modifier),
			component: (element, value) => component(element, value, methods),
			bind: (element, value, modifier, args, transform, directive, code) => bind(element, value, modifier, args, transform, code, bus)
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

			this.directives[directive](element, value, modifier, args, this.methods.transform, directive, code)
			return
		}
		if (directive in element) {
			property(element, value, modifier, args, this.methods.transform, directive)
			return
		}
		attr(element, value, modifier, args, this.methods.transform, directive)
	}
}