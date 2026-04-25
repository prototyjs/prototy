import { applyModifier } from '@/directives/modifiers/applyModifier'
/**
 *
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifier
 * @param { Array<string> } args
 */
export function text(element, value, modifier, args) {

	element.textContent = applyModifier(value, modifier, args) ?? ''
}