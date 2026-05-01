// export const modifiers = {
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @param { number } n
// 	 * @returns { string }
// 	 */
// 	fixed: (value, n = 2) => Number(value).toFixed(n),
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @param { number } n
// 	 * @returns { number }
// 	 */
// 	int: (value, n = 10) => parseInt(value, n),
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @returns { number }
// 	 */
// 	abs: (value) => Math.abs(Number(value)),
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @returns { number }
// 	 */
// 	round: (value) => Math.round(Number(value)),
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @param { number } min
// 	 * @param { number } max
// 	 * @returns { number }
// 	 */
// 	clamp: (value, min = 0, max = 1) =>
// 		Math.min(Math.max(Number(value), min), max),
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @param { string } u
// 	 * @returns { string }
// 	 */
// 	unit: (value, u = 'px') => Number(value) + u,
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @returns { string }
// 	 */
// 	trim: (value) => String(value).trim(),
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @returns { string }
// 	 */
// 	upper: (value) => String(value).toUpperCase(),
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @returns { string }
// 	 */
// 	lower: (value) => String(value).toLowerCase(),
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @returns { string }
// 	 */
// 	capitalize: (value) =>
// 		String(value).charAt(0).toUpperCase() + String(value).slice(1),
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @param { string } def
// 	 * @returns { any }
// 	 */
// 	default: (value, def = '-') => (value || value === 0 ? value : def),
// 	/**
// 	 *
// 	 * @param { any } value
// 	 * @returns { string }
// 	 */
// 	json: (value) => JSON.stringify(value)
// }

import { log } from '@/log'
/**
 * @typedef {function(any, ...any): any} ModifierFunction
 */

/**
 * @typedef {object} ModifiersMap
 * @property {ModifierFunction} fixed
 * @property {ModifierFunction} int
 * @property {ModifierFunction} abs
 * @property {ModifierFunction} round
 * @property {ModifierFunction} clamp
 * @property {ModifierFunction} unit
 * @property {ModifierFunction} trim
 * @property {ModifierFunction} upper
 * @property {ModifierFunction} lower
 * @property {ModifierFunction} capitalize
 * @property {ModifierFunction} default
 * @property {ModifierFunction} json
 */

/** @type {ModifiersMap} */
const defaultModifiers = {
	/**
	 * @param {any} value
	 * @param {number} [n=2]
	 * @returns {string}
	 */
	fixed: (value, n = 2) => Number(value).toFixed(n),
	/**
	 * @param {any} value
	 * @param {number} [n=10]
	 * @returns {number}
	 */
	int: (value, n = 10) => parseInt(value, n),
	/**
	 * @param {any} value
	 * @returns {number}
	 */
	abs: (value) => Math.abs(Number(value)),
	/**
	 * @param {any} value
	 * @returns {number}
	 */
	round: (value) => Math.round(Number(value)),
	/**
	 * @param {any} value
	 * @param {number} [min=0]
	 * @param {number} [max=1]
	 * @returns {number}
	 */
	clamp: (value, min = 0, max = 1) => Math.min(Math.max(Number(value), min), max),
	/**
	 * @param {any} value
	 * @param {string} [u='px']
	 * @returns {string}
	 */
	unit: (value, u = 'px') => Number(value) + u,
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	trim: (value) => String(value).trim(),
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	upper: (value) => String(value).toUpperCase(),
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	lower: (value) => String(value).toLowerCase(),
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	capitalize: (value) => String(value).charAt(0).toUpperCase() + String(value).slice(1),
	/**
	 * @param {any} value
	 * @param {string} [def='-']
	 * @returns {any}
	 */
	default: (value, def = '-') => (value || value === 0 ? value : def),
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	json: (value) => JSON.stringify(value),
}
/**
 * @typedef {object} ModifiersConfig
 * @property {Record<string, ModifierFunction>} [modifiers]
 */
export class Modifiers {
	/** @type {Record<string, ModifierFunction>} */
	modifiers
	/**
	 * @param {Record<string, ModifierFunction>} [clientModifiers]
	 */
	constructor(clientModifiers = {}) {
		this.modifiers = { ...defaultModifiers, ...clientModifiers }
	}

	/**
	 * @param { string } name
	 * @param { any } value
	 * @param  {...any} args
	 * @returns { any }
	 */
	apply(name, value, ...args) {
		if (!name) {
			return value
		}

		if (Object.prototype.hasOwnProperty.call(this.modifiers, name)) {
			return this.modifiers[name](value, ...args)
		}

		log.error(`Unknown modifier "${name}"`)
		return value
	}

	/**
	 * @returns { object }
	 */
	getAll() {
		return this.modifiers
	}
}