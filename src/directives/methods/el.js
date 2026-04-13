/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { object } bus
 */
export function el(element, value, bus) {
	if (element._el && element._el !== value) {
		if (bus.els[element._el] === element) {
			delete bus.els[element._el]
		}
	}
	if (typeof value === 'string') {
		element._el = value
		bus.els[value] = element
	}
}