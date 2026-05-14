import { describe, it, expect } from 'vitest'
import { prototy, nextTick } from '@'

describe('Text Directive', () => {
	it('should update text after state change', async () => {
		document.body.innerHTML = '<div :text="value"></div>'
		const app = prototy({
			root: document.body,
			state: { value: 1 },
			params: {
				max: 9
			},
			methods: {
				add() {}
			}
		})

		expect(document.body.firstElementChild.textContent).toBe('1')
		app.state.value++
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('2')
	})
})