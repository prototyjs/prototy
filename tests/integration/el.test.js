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

	it('should execute expression and provide el as local variable', async () => {
		document.body.innerHTML = '<div :el="myElement.target = el"></div>'
		const app = prototy({
			root: document.body,
			params: {
				myElement: {
					target: null
				}
			}
		})
		await nextTick()
		expect(document.body.firstElementChild).toBe(app.params.myElement.target)
	})

	it('should handle syntax errors gracefully and log them', () => {
		document.body.innerHTML = '<div :el="myElement"></div>'

		prototy({ root: document.body })

		const lastLogMessage = consoleSpy.mock.lastCall[0]
		expect(lastLogMessage).toContain('[PROTOTY] ReferenceError: "myElement" is not defined')
	})
})