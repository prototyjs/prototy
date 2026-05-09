/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifier
 * @param { Array<string> } args
 * @param { string } code
 * @param { string } directive
 * @param { Function } transform
 */
export function attr(element, value, modifier, args, code, directive, transform) {
	const v = value
	
	if (v !== undefined && v !== null && v !== false) {
		element.setAttribute(directive, v)
	} else {
		element.removeAttribute(directive)
	}
}