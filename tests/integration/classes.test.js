import { describe, it, expect } from 'vitest'
import { prototy } from '@'

describe('Classes Directive', () => {

	it('add class when condition is true', async () => {
		document.body.innerHTML = '<div :class="{ active: state.isActive }"></div>'

		prototy({
			root: document.body,
			state: { isActive: true }
		})

		expect(document.body.firstElementChild.classList.contains('active')).toBe(true)
	})

	it('does not add class when condition is false', async () => {
		document.body.innerHTML = '<div :class="{ active: state.isActive }"></div>'

		prototy({
			root: document.body,
			state: { isActive: false }
		})

		expect(document.body.firstElementChild.classList.contains('active')).toBe(false)
	})

	it('handles multiple classes with different conditions', async () => {
		document.body.innerHTML = '<div :class="{ active: state.isActive, disabled: state.isDisabled, visible: state.isVisible }"></div>'

		prototy({
			root: document.body,
			state: {
				isActive: true,
				isDisabled: false,
				isVisible: true
			}
		})

		const div = document.body.firstElementChild
		expect(div.classList.contains('active')).toBe(true)
		expect(div.classList.contains('disabled')).toBe(false)
		expect(div.classList.contains('visible')).toBe(true)
		expect(div.classList.length).toBe(2)
	})

})