import { applyModifier } from '@/directives/modifiers/applyModifier.js'

/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifier
 * @param { Array<string> } args
 * @param { string } directive
 */
export function primitive(element, value, modifier, args, directive) {
	const v = applyModifier(value, modifier, args)

	if (typeof element[directive] === 'boolean') {
		element[directive] = Boolean(v)
	} else {
		element[directive] = v ?? ''
	}
}