import innerDirectives from './methods/index.js'
import { attr } from './methods/attr.js'
import { each } from './methods/each.js'
import { context } from './methods/context.js'
import { component } from './methods/component.js'
import { applyModifier } from '@/directives/modifiers/applyModifier.js'

/**
 * @class Directives
 */
export class Directives {
	/**
	 * @constructor
	 * @param { object } clientDirectives
	 * @param { Function } setup
	 */
	constructor(clientDirectives = {}, setup) {
		this.#contextStorage = new WeakMap()
		/**
		 * @type {{ [key: string]: Function }}
		 */
		this.directives = {
			...innerDirectives,
			...clientDirectives
		}
		this.specialDirectives = {
			each: (element, value) => each(element, value, setup),
			context: (element, value, modifier) => context(element, value, modifier, this.#contextStorage),
			component: (element, value) => component(element, value)
		}
	}
	#contextStorage
	/**
	 *
	 * @param { HTMLElement } element
	 * @param { string } key
	 * @param { any } value
	 */
	apply(element, key, value) {
		const [directive, modifier, ...args] = key.split('.')

		if (Object.hasOwn(this.specialDirectives, directive)) {
			this.specialDirectives[directive](element, value, modifier)
			return
		}

		if (Object.hasOwn(this.directives, directive)) {
			this.directives[directive](element, value, modifier, args)
			return
		}

		if (directive in element) {
			this.property(element, value, modifier, args, directive)
			return
		}

		attr(element, value, modifier, args, directive)
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

	/**
	 * @param { HTMLElement } element
	 * @param { any } value
	 * @param { string } modifier
	 * @param { Array<string> } args
	 * @param { string } directive
	 */
	property(element, value, modifier, args, directive) {
		const v = applyModifier(value, modifier, args)

		if (typeof element[directive] === 'boolean') {
			element[directive] = Boolean(v)
		} else {
			element[directive] = v ?? ''
		}
	}
}