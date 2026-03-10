import { applyModifier } from '../modifiers/applyModifier'

/**
 *
 * @param {HTMLElement} element
 * @param {any} value
 * @param {string} modifier
 * @param {string | number} args
 */
export function html(element, value, modifier, args) {
	element.innerHTML = applyModifier(value, modifier, args) ?? ''
}