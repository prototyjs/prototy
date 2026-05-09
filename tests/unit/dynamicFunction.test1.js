import { describe, it, expect } from 'vitest'
import { dynamicFunction } from '@/utils/dynamicFunction.js'

describe('dynamicFunction', () => {
	const bus = {
		state: { score: 10 }
	}
	const el = document.createElement('div')

	it('should execute basic code using bus context', () => {
		const code = 'state.score * 2'
		const fn = dynamicFunction(code, bus)
		expect(fn(el, {})).toBe(20)
	})

	it('should inject local value using the provided key (formerly placeholder logic)', () => {
		const code = 'val + "!"'
		const fn = dynamicFunction(code, bus, 'val')
		expect(fn(el, {}, 'hello')).toBe('hello!')
	})

	it('should correctly merge bus and dynamic context from DOM', () => {
		const code = 'state.score * multiplier'
		const fn = dynamicFunction(code, bus)

		const dynamicContext = { multiplier: 3 }
		expect(fn(el, dynamicContext)).toBe(30)
	})

	it('should support index as a separate argument', () => {
		const code = 'item + "_" + index'
		const fn = dynamicFunction(code, bus, 'item')

		expect(fn(el, {}, 'test', 5)).toBe('test_5')
	})

	it('should handle event variable for listeners', () => {
		const code = 'event.type'
		const fn = dynamicFunction(code, bus, 'event')

		const mockEvent = { type: 'click' }
		expect(fn(el, {}, mockEvent)).toBe('click')
	})
})