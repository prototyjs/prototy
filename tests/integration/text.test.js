import { describe, it, expect, beforeEach } from 'vitest'
import { Prototy, nextTick } from '@/prototy.js'

let prototy

describe('Text Directive', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div :text="state.value"></div>'
		prototy = new Prototy({
			root: document.body,
			state: { value: 1 }
		})
	})

	it('should update text after state change', async () => {
		expect(document.body.firstElementChild.textContent).toBe('1')
		prototy.state.value++
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('2')
	})
})