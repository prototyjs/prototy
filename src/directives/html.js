/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifier
 * @param { Array<string> } args
 * @param { string } code
 * @param { string } directive
 * @param { Function } transform
 */
export function html(element, value, modifier, args, code, directive, transform) {
	element.innerHTML = transform(modifier, value, ...args) ?? ''
}