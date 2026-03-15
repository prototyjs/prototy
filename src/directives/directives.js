import innerDirectives from './methods/index.js'
import { attr } from './methods/attr.js'
import { each } from './methods/each.js'
import { context } from './methods/context.js'

/**
 * @class Directives
 */
class Directives {
	/**
	 * @constructor
	 * @param {object} clientDirectives
	 * @param {Function} setup
	 */
	constructor(clientDirectives = {}, setup) {
		this.setup = setup
		this.#contextStorage = new WeakMap()
		/**
		 * @type {{[key: string]: Function}}
		 */
		this.directives = {
			...innerDirectives,
			...clientDirectives
		}
	}
	#contextStorage
	/**
	 *
	 * @param {HTMLElement} element
	 * @param {string} key
	 * @param {any} value
	 */
	apply(element, key, value) {
		const [directive, modifier, ...args] = key.split('.') // ['text', 'fixed', '2', ...] // text.fixed.2

		if (directive === 'each') {
			each(element, value, this.setup)
			return
		}

		if (directive === 'context') {
			context(element, value, this.#contextStorage)
			return
		}

		if (Object.prototype.hasOwnProperty.call(this.directives, directive)) {
			this.directives[directive](element, value, modifier, args)
		} else {
			attr(element, value, modifier, args, directive)
		}
	}
	/**
	 * @param {HTMLElement} element
	 * @returns {object}
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
export default Directives