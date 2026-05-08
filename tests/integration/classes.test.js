import { describe, it, expect } from 'vitest'
import { prototy, nextTick } from '@'

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
	})

	it('updates class when condition changes from false to true', async () => {
		document.body.innerHTML = '<div :class="{ active: state.isActive }"></div>'
		const app = prototy({
			root: document.body,
			state: { isActive: false }
		})
		await nextTick()

		app.state.isActive = true
		await nextTick()

		expect(document.body.firstElementChild.classList.contains('active')).toBe(true)
	})

	it('updates class when condition changes from true to false', async () => {
		document.body.innerHTML = '<div :class="{ active: state.isActive }"></div>'
		const app = prototy({
			root: document.body,
			state: { isActive: true }
		})
		await nextTick()

		app.state.isActive = false
		await nextTick()

		expect(document.body.firstElementChild.classList.contains('active')).toBe(false)
	})

	it('updates multiple classes reactively', async () => {
		document.body.innerHTML = '<div :class="{ active: state.isActive, disabled: state.isDisabled }"></div>'
		const app = prototy({
			root: document.body,
			state: { isActive: false, isDisabled: true }
		})
		await nextTick()

		app.state.isActive = true
		app.state.isDisabled = false
		await nextTick()

		const div = document.body.firstElementChild
		expect(div.classList.contains('active')).toBe(true)
		expect(div.classList.contains('disabled')).toBe(false)
	})
})