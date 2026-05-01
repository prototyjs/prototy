/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifierName
 * @param { Array<string> } modifierArgs
 * @param { string } code
 * @param { string } directive
 * @param { any } modifiers
 */
export function html(element, value, modifierName, modifierArgs, code, directive, modifiers) {
	if (!modifiers || typeof modifiers.apply !== 'function') {
		console.warn('Modifiers not available for html directive', element)
		element.innerHTML = value ?? ''
		return
	}
	
	element.innerHTML = modifiers.apply(modifierName, value, ...modifierArgs) ?? ''
}