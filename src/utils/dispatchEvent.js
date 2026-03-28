/**
 * @param { HTMLElement } element
 * @param { string } name
 * @param { object } detail
 */
export function dispatchEvent(element, name, detail) {
	const event = new CustomEvent(name, { detail })
	element.dispatchEvent(event)
}