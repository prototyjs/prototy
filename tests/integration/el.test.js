import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prototy, nextTick } from '@'

describe('El Directive', () => {

	const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

	beforeEach(() => {
		consoleSpy.mockClear()
	})

	it('should register element in app.els when string name is provided', () => {
		document.body.innerHTML = '<div :el="`myElement`"></div>'
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

		const lastLogMessage = consoleSpy.mock.lastCall[0]
		expect(lastLogMessage).toContain('[PROTOTY] ReferenceError: myElement is not defined')
	})
	it('should remove element from app.els when element is removed from DOM', async () => {
		document.body.innerHTML = '<div id="test" :el="`myElement`"></div>'
		const app = prototy({ root: document.body })
		const el = document.getElementById('test')

		expect(app.els.myElement).toBe(el)
		el.remove()
		await nextTick()
		expect(app.els.myElement).toBeUndefined()
	})

	it('should handle reactive name change and cleanup old key', async () => {
		document.body.innerHTML = '<div :el="state.isMain ? `primary` : `secondary` "></div>'

		const app = prototy({
			root: document.body,
			state: { isMain: true }
		})

		const el = document.body.firstElementChild

		expect(app.els.primary).toBe(el)
		expect(app.els.secondary).toBeUndefined()

		app.state.isMain = false
		await nextTick()

		expect(app.els.primary).toBeUndefined()
		expect(app.els.secondary).toBe(el)

		app.state.isMain = true
		await nextTick()

		expect(app.els.secondary).toBeUndefined()
		expect(app.els.primary).toBe(el)
	})

	it('should not delete reference if key was taken by another element', async () => {
		document.body.innerHTML = `
    <div id="el1" :el="'shared'"></div>
    <div id="el2" :el="'shared'"></div>
  `
		const app = prototy({ root: document.body })

		await nextTick()

		const el1 = document.getElementById('el1')
		const el2 = document.getElementById('el2')

		expect(app.els.shared).toBe(el2)

		el1.remove()
		await nextTick()

		expect(app.els.shared).toBe(el2)
	})
})