import { applyModifier } from "../modifiers/applyModifier.js"

/**
 * 
 * @param {HTMLElement} element 
 * @param {Object} value 
 * @param {string} modifier 
 * @param {string | number} args 
 * @param {string} directive 
 */
export function _attr(element, value, modifier, args, directive) {
	const v = applyModifier(value, modifier, args, directive)
	if (v !== undefined && v !== null && v !== false) {
		element.setAttribute(directive, v)
	} else {
		element.removeAttribute(directive)
	}
}