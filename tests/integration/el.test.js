import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prototy, nextTick } from '@'

describe('El Directive', () => {

	const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

	beforeEach(() => {
		consoleSpy.mockClear()
		document.body.innerHTML = ''
	})

	it('should register element in app.els via static el attribute', () => {
		document.body.innerHTML = '<div el="staticElement"></div>'
		const app = prototy({ root: document.body })

		expect(app.els.staticElement).toBe(document.body.firstElementChild)
	})

	it('should remove static el from app.els when element is removed', async () => {
		document.body.innerHTML = '<div id="test" el="toDelete"></div>'
		const app = prototy({ root: document.body })
		const el = document.getElementById('test')

		expect(app.els.toDelete).toBe(el)

		el.remove()

		await nextTick()
		expect(app.els.toDelete).toBeUndefined()
	})

	it('should execute expression and provide el as local variable', () => {
		document.body.innerHTML = '<div :el="params.myElement = el"></div>'
		const app = prototy({
			root: document.body,
			params: {
				myElement: null
			}
		})
		expect(document.body.firstElementChild).toBe(app.params.myElement)
	})

	it('should handle syntax errors gracefully and log them', () => {
		document.body.innerHTML = '<div :el="myElement"></div>'

		prototy({ root: document.body })

		const lastLogMessage = consoleSpy.mock.lastCall[0]
		expect(lastLogMessage).toContain('[PROTOTY] ReferenceError: myElement is not defined')
	})
})