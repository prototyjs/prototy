/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { prototy, nextTick } from '@/index.js'

describe('Text Directive - boolean and zero (jsdom)', () => {
	beforeEach(() => {
		document.body.innerHTML = ''
	})

	it('should handle false as string', async () => {
		document.body.innerHTML = '<div :text="state.value"></div>'
		const app = prototy({
			root: document.body,
			state: { value: true }
		})
		expect(document.body.firstElementChild.textContent).toBe('true')
		app.state.value = false
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('false')
	})

	it('should handle 0 as string', async () => {
		document.body.innerHTML = '<div :text="state.value"></div>'
		const app = prototy({
			root: document.body,
			state: { value: 42 }
		})
		expect(document.body.firstElementChild.textContent).toBe('42')
		app.state.value = 0
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('0')
	})
})
it('should convert numbers to strings', async () => {
	document.body.innerHTML = '<div :text="state.value"></div>'
	const app = prototy({
		root: document.body,
		state: { value: 42 }
	})

	expect(document.body.firstElementChild.textContent).toBe('42')
	app.state.value = 0
	await nextTick()
	expect(document.body.firstElementChild.textContent).toBe('0')
})