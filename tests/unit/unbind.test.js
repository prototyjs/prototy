import { describe, it, expect, beforeEach } from 'vitest'
import { unbind } from '@/utils/unbind.js'

describe('unbind', () => {
	let element

	beforeEach(() => {
		element = {}
	})

	it('should return early if _bound is missing', () => {
		expect(() => unbind(element)).not.toThrow()
		expect(element).toEqual({})
	})

	it('should delete properties listed in _bound from the element', () => {
		element.oninput = () => {}
		element.onchange = () => {}
		element.someOtherProp = 'keep me'

		element._bound = {
			oninput: 'value',
			onchange: 'title'
		}

		unbind(element)

		expect(element.oninput).toBeUndefined()
		expect(element.onchange).toBeUndefined()
		expect('oninput' in element).toBe(false)

		expect(element.someOtherProp).toBe('keep me')
	})

	it('should delete the _bound registry itself', () => {
		element._bound = { oninput: 'value' }

		unbind(element)

		expect(element._bound).toBeUndefined()
		expect('_bound' in element).toBe(false)
	})

	it('should work correctly with Object.defineProperty (simulating bind behavior)', () => {
		element._bound = { oninput: 'value' }
		Object.defineProperty(element, 'oninput', {
			get: () => () => 'handler',
			configurable: true,
			enumerable: true
		})

		unbind(element)

		expect(element.oninput).toBeUndefined()
		expect('_bound' in element).toBe(false)
	})
})