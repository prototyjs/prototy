/**
 *
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifier
 * @param { Array<string> } args
 * @param { Function } transform 
 */
export function html(element, value, modifier, args, transform) {
	element.innerHTML = transform(value, modifier, args) ?? ''
}