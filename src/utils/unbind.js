/**
 * @param { HTMLElement } element
 */
export function unbind(element) {
	if (!element._bound) {
		return
	}
	for (const eventName in element._bound) {
		delete element[eventName]
	}
	delete element._bound
}