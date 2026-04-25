import { describe, it, expect, vi } from 'vitest'
import { dispatchEvent } from '@/utils/dispatchEvent.js'

describe('dispatchEvent', () => {
	it('should dispatch a CustomEvent with detail and done callback', () => {
		const element = document.createElement('div')
		const detail = { id: 1 }
		const done = vi.fn()
		const eventName = 'test-event'

		element.addEventListener(eventName, (event) => {
			expect(event.detail).toEqual(detail)
			expect(event.done).toBe(done)
		})

		dispatchEvent(element, eventName, detail, done)
	})

	it('should work without a done callback', () => {
		const element = document.createElement('div')
		const eventName = 'simple-event'

		element.addEventListener(eventName, (event) => {
			expect(event.done).toBeUndefined()
		})

		dispatchEvent(element, eventName, { foo: 'bar' })
	})
})