import { isObject } from '@/utils/isObject.js'

/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifierName
 * @param { Array<string> } modifierArgs
 * @param { string } directive
 * @param { any } modifiers
 */
export function property(element, value, modifierName, modifierArgs, directive, modifiers) {
	if (isObject(value)) {
		Object.assign(element[directive], value)
		return
	}

	let v = value
	if (modifiers && typeof modifiers.apply === 'function') {
		v = modifiers.apply(modifierName, value, ...modifierArgs)
	}

	if (typeof element[directive] === 'boolean') {
		element[directive] = Boolean(v)
	} else {
		element[directive] = v ?? ''
	}
}