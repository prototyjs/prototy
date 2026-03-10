import innerDirectives from './methods/index.js'
import { attr } from './methods/attr.js'
import { each } from './methods/each.js'
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
		/**
		 * @type {{[key: string]: Function}}
		 */
		this.directives = {
			...innerDirectives,
			...clientDirectives
		}
	}
	/**
	 *
	 * @param {HTMLElement} element
	 * @param {string} key
	 * @param {*} value
	 */
	apply(element, key, value) {
		const [directive, modifier, ...args] = key.split('.') // ['text', 'fixed', '2', ...] // text.fixed.2
    
		if (directive === 'each') {
			each(value, element, this.setup)
			return
		}

		if (Object.prototype.hasOwnProperty.call(this.directives, directive) || directive==='text') {
			this.directives['_' + directive](element, value, modifier, args)
		} else {
			attr(element, value, modifier, args, directive)
		}
	}
}
export default Directives