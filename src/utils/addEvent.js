export function addEvent(element, name, handler, mods = []) {

	const options = {
		once: mods.includes('once'),
		capture: mods.includes('capture'),
		passive: mods.includes('passive')
	}

	const wrapper = (event) => {
		if (mods.includes('stop')) event.stopPropagation()
		if (mods.includes('prevent')) event.preventDefault()
		if (mods.includes('self') && event.target !== element) return
		if (mods.includes('enter') && event.key !== 'Enter') return

		handler(event)
	}
	element.addEventListener(name, wrapper, options)
}