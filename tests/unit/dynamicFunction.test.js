import { describe, it, expect } from 'vitest'
import { dynamicFunction } from '@/utils/dynamicFunction.js'

describe('dynamicFunction', () => {
	const bus = {
		state: { score: 10 },
		methods: {},
		params: {},
		root: document.body,
		components: {},
		els: {}
	}
	const el = document.createElement('div')

	it('should execute basic code using bus context', () => {
		const code = 'score * 2'
		const fn = dynamicFunction(code, bus)
		expect(fn(el, {})).toBe(20)
	})

	it('should inject local value using the provided key (formerly placeholder logic)', () => {
		const code = 'val + "!"'
		const fn = dynamicFunction(code, bus, 'val')
		expect(fn(el, {}, 'hello')).toBe('hello!')
	})

	it('should correctly merge bus and dynamic context from DOM', () => {
		const code = 'score * multiplier'
		const fn = dynamicFunction(code, bus)

		const dynamicContext = { multiplier: 3 }
		expect(fn(el, dynamicContext)).toBe(30)
	})

	it('should support index as a separate argument', () => {
		const code = 'item + "_" + index'
		const fn = dynamicFunction(code, bus, 'item')

		const dynamicContext = { index: 5 }  // index в context
		expect(fn(el, dynamicContext, 'test')).toBe('test_5')
	})

	it('should handle event variable for listeners', () => {
		const code = 'event.type'
		const fn = dynamicFunction(code, bus, 'event')

		const mockEvent = { type: 'click' }
		expect(fn(el, {}, mockEvent)).toBe('click')
	})

	it('should provide el variable', () => {
		const code = 'el.tagName'
		const fn = dynamicFunction(code, bus)

		expect(fn(el, {})).toBe('DIV')
	})

	it('should access params', () => {
		const testBus = {
			...bus,
			params: { version: '1.0' }
		}
		const code = 'version'
		const fn = dynamicFunction(code, testBus)

		expect(fn(el, {})).toBe('1.0')
	})
})