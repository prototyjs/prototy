import { describe, it, expect, beforeEach } from 'vitest'
import { prototy, nextTick } from '@/index.js'

let app

describe('Text Directive', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div :text="state.value"></div>'
		app = prototy({
			root: document.body,
			state: { value: 1 }
		})
	})

	it('should update text after state change', async () => {
		expect(document.body.firstElementChild.textContent).toBe('1')
		app.state.value++
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('2')
	})
})