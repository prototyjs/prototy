/**
 *
 * @param { HTMLElement } element
 * @param { object } value
 * @param { string } modifier
 * @param { Array <string> } args
 * @param { Function } transform
 * @param { string } directive
 */
export function attr(element, value, modifier, args, transform, directive) {
	const v = transform(value, modifier, args)
	if (v !== undefined && v !== null && v !== false) {
		element.setAttribute(directive, v)
	} else {
		element.removeAttribute(directive)
	}
}