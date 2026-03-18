/**
 * @param { string } content
 * @param { HTMLElement } [node]
 * @returns { DocumentFragment }
 */
export function render(content, node) {
	const template = document.createElement('template')
	template.innerHTML = content
	if (node) {
		node.appendChild(template.content)
	} else {
		return template.content.firstElementChild
	}
}