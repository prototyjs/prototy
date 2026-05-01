/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifierName
 * @param { Array<string> } modifierArgs
 * @param { string } code
 * @param { string } directive
 * @param { any } modifiers
 */
export function text(element, value, modifierName, modifierArgs, code, directive, modifiers) {
	if (!modifiers || typeof modifiers.apply !== 'function') {
		console.warn('Modifiers not available for text directive', element)
		element.textContent = value ?? ''
		return
	}
	
	element.textContent = modifiers.apply(modifierName, value, ...modifierArgs) ?? ''
}