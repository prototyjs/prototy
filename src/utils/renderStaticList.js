/**
 * @param { HTMLElement } container
 * @param { Array } array
 * @param { string } itemName
 * @param { string } indexName
 * @param { object } api
 */
export function renderStaticList(container, array, itemName, indexName, api) {
	const fragment = document.createDocumentFragment()
	const contextData = {}

	const nodes = array.map((item, index) => {
		const node = container._template.cloneNode(true)
		fragment.appendChild(node)
		return { node, item, index }
	})

	container.appendChild(fragment)

	nodes.forEach(({ node, item, index }) => {
		contextData[itemName] = item
		contextData[indexName] = index
		api.context(node, contextData)
		api.setup(node)
	})
}