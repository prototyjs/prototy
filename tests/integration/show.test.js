import { describe, it, expect } from 'vitest'
import { prototy, nextTick } from '@'

describe('Show Directive', () => {

	it('shows element when value is true', async () => {
		document.body.innerHTML = '<div :show="state.isVisible"></div>'
		prototy({
			root: document.body,
			state: { isVisible: true }
		})
		await nextTick()
		expect(document.body.firstElementChild.style.display).toBe('')
	})

	it('hides element when value is false', async () => {
		document.body.innerHTML = '<div :show="state.isVisible"></div>'
		prototy({
			root: document.body,
			state: { isVisible: false }
		})
		await nextTick()
		expect(document.body.firstElementChild.style.display).toBe('none')
	})

	it('shows element when value changes from false to true', async () => {
		document.body.innerHTML = '<div :show="state.isVisible"></div>'
		const app = prototy({
			root: document.body,
			state: { isVisible: false }
		})
		await nextTick()
		expect(document.body.firstElementChild.style.display).toBe('none')

		app.state.isVisible = true
		await nextTick()
		expect(document.body.firstElementChild.style.display).toBe('')
	})

	it('hides element when value changes from true to false', async () => {
		document.body.innerHTML = '<div :show="state.isVisible"></div>'
		const app = prototy({
			root: document.body,
			state: { isVisible: true }
		})
		await nextTick()
		expect(document.body.firstElementChild.style.display).toBe('')

		app.state.isVisible = false
		await nextTick()
		expect(document.body.firstElementChild.style.display).toBe('none')
	})
})