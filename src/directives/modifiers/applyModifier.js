import { modifiers } from './base.js'
/**
 *
 * @param {any} value
 * @param {string} modifier
 * @param {string | number} args
 * @returns {any}
 */
export function applyModifier(value, modifier, args) {
	if (!modifier) {
		return value
	}

	if (Object.prototype.hasOwnProperty.call(modifiers, modifier)) {
		return modifiers[modifier](value, ...args)
	}
	
	// eslint-disable-next-line no-console
	console.error('error modifier')
	return value
  
}