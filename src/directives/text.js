/**
 *
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifier
 * @param { Array<string> } args
 * @param { Function } transform
 */
export function text(element, value, modifier, args, transform) {
	element.textContent = transform(value, modifier, args) ?? ''
}