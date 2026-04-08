import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prototy } from '@'

describe('El Directive', () => {

	const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

	beforeEach(() => {
		consoleSpy.mockClear()
	})

	it('should register element in app.els when string name is provided', () => {
		document.body.innerHTML = '<div :el="\'myElement\'"></div>'
		const app = prototy({ root: document.body })
		expect(document.body.firstElementChild).toBe(app.els?.myElement)
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

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining('[PROTOTY] ReferenceError: myElement is not defined'),
			expect.anything()
		)
	})
})