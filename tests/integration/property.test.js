import { describe, it, expect } from 'vitest'
import { prototy } from '@'

describe('Property Directive', () => {

	it('sets the textContent(stroke)', async () => {
		document.body.innerHTML = '<div :text="state.message"></div>'

		prototy({
			root: document.body,
			state: { message: 'Prototy' }
		})

		expect(document.body.firstElementChild.textContent).toBe('Prototy')
	})

	it('sets the style (object).', async () => {
		document.body.innerHTML = '<div :style="state.styles"></div>'

		prototy({
			root: document.body,
			state: { styles: { color: 'red', fontSize: '20px' } }
		})

		const div = document.body.firstElementChild
		expect(div.style.color).toBe('red')
		expect(div.style.fontSize).toBe('20px')
	})

	it('sets the data-set (object)', async () => {
		document.body.innerHTML = '<div :dataset="state.data"></div>'

		prototy({
			root: document.body,
			state: { data: { userId: '123', role: 'admin' } }
		})

		const div = document.body.firstElementChild
		expect(div.dataset.userId).toBe('123')
		expect(div.dataset.role).toBe('admin')
	})

	it('sets the hidden (boolean)', async () => {
		document.body.innerHTML = '<div :hidden="state.isHidden"></div>'

		prototy({
			root: document.body,
			state: { isHidden: true }
		})

		expect(document.body.firstElementChild.hidden).toBe(true)
	})
})