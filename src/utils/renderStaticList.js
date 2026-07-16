/**
 * @param { HTMLElement } container
 * @param { Array } array
 * @param { object } api
 */
export function renderStaticList(container, array, api) {

	const fragment = document.createDocumentFragment()

	array.forEach((item, index) => {
		const node = container._template.cloneNode(true)
		api.context(node, { item, index })
		api.setup(node)
		fragment.appendChild(node)
	})

	container.appendChild(fragment)
}