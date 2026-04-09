/**
 * @param { HTMLElement } element
 * @param { string } name
 * @param { object } detail
 * @param { Function } done
 */
export function dispatchEvent(element, name, detail, done) {
	const event = new CustomEvent(name, { detail })
	event.done = done
	element.dispatchEvent(event)
}