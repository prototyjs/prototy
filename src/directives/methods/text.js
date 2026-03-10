import { applyModifier } from '../modifiers/applyModifier'
/**
 *
 * @param {HTMLElement} element
 * @param {any} value
 * @param {string} modifier
 * @param {string | number} args
 */
export function text(element, value, modifier, args) {
	element.textContent = applyModifier(value, modifier, args) ?? ''
}