/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { object } bus
 */
export function el(element, value, bus) {
	if (typeof value === 'string') {
		bus.els[value] = element
	}
}