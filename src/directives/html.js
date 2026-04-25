import { applyModifier } from '@/directives/modifiers/applyModifier'

/**
 *
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifier
 * @param { Array<string> } args
 */
export function html(element, value, modifier, args) {
	element.innerHTML = applyModifier(value, modifier, args) ?? ''
}