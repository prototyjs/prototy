/**
 * @param { HTMLElement } container
 * @param { Array } array
 * @param { object } methods
 */
export function renderStaticList(container, array, methods) {

	const fragment = document.createDocumentFragment()

	array.forEach((item, index) => {
		const node = container._template.cloneNode(true)
		methods.context(node, { item, index })
		methods.setup(node)
		fragment.appendChild(node)
	})

	container.appendChild(fragment)
}