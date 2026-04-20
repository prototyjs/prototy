import { isObject } from '@/utils/isObject.js'
import { applyModifier } from '@/directives/modifiers/applyModifier.js'

/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifier
 * @param { Array<string> } args
 * @param { string } directive
 */
export function property(element, value, modifier, args, directive) {

	if (isObject(value)) {
		Object.assign(element[directive], value)
		return
	}

	const v = applyModifier(value, modifier, args)

	if (typeof element[directive] === 'boolean') {
		element[directive] = Boolean(v)
	} else {
		element[directive] = v ?? ''
	}
}