import { describe, it, expect } from 'vitest'
import { render } from '@/component/render.js'

describe('render', () => {
	it('should return a DocumentFragment', () => {
		const fragment = render('<div></div>')
		expect(fragment).toBeInstanceOf(DocumentFragment)
	})

	it('should render HTML content correctly', () => {
		const html = '<div class="test"><span>Hello</span></div>'
		const fragment = render(html)

		const div = fragment.querySelector('.test')
		expect(div).not.toBeNull()
		expect(div.querySelector('span').textContent).toBe('Hello')
	})

	it('should handle multiple top-level elements', () => {
		const html = '<p>One</p><p>Two</p>'
		const fragment = render(html)

		expect(fragment.childNodes.length).toBe(2)
		expect(fragment.firstElementChild.textContent).toBe('One')
		expect(fragment.lastElementChild.textContent).toBe('Two')
	})

	it('should return an empty fragment for empty strings', () => {
		const fragment = render('')
		expect(fragment.childNodes.length).toBe(0)
	})
})