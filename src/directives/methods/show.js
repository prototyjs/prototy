/**
 *
 * @param {HTMLElement} element
 * @param {boolean} value
 */
export function show(element, value) {
	element.style.display = value ? '' : 'none'
}