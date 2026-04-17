/**
 * @param { string } content
 * @returns { DocumentFragment }
 */
export function render(content) {
	const template = document.createElement('template')
	template.innerHTML = content
	return template.content
}