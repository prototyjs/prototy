/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifierName
 * @param { Array<string> } modifierArgs
 * @param { string } attrName
 * @param { string } directive
 * @param { any } modifiers
 */
export function attr(element, value, modifierName, modifierArgs, attrName, directive, modifiers) {
	let v = value
	
	if (modifiers && typeof modifiers.apply === 'function') {
		v = modifiers.apply(modifierName, value, ...modifierArgs)
	}
	
	if (v !== undefined && v !== null && v !== false) {
		element.setAttribute(attrName, v)
	} else {
		element.removeAttribute(attrName)
	}
}