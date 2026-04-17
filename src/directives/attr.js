import { applyModifier } from '@/directives/modifiers/applyModifier'
/**
 *
 * @param { HTMLElement } element
 * @param { object } value
 * @param { string } modifier
 * @param { Array <string> } args
 * @param { string } attrName
 */
export function attr(element, value, modifier, args, attrName) {
	const v = applyModifier(value, modifier, args)
	if (v !== undefined && v !== null && v !== false) {
		element.setAttribute(attrName, v)
	} else {
		element.removeAttribute(attrName)
	}
}