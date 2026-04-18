import { describe, it, expect } from 'vitest'
import { dynamicFunction } from '@/utils/dynamicFunction.js'

describe('dynamicFunction', () => {
	const bus = { state: { score: 10 } }
	const el = document.createElement('div')

	it('should execute basic code using bus context', () => {
		const code = 'state.score * 2'
		const fn = dynamicFunction(code, bus)

		expect(fn(el)).toBe(20)
	})

	it('should inject and replace the placeholder value', () => {
		const code = 'val + "!"'
		const fn = dynamicFunction(code, bus, {}, 'val')

		expect(fn(el, 'hello')).toBe('hello!')
	})

	it('should correctly merge bus and local context', () => {
		const context = { multiplier: 3 }
		const code = 'state.score * multiplier'
		const fn = dynamicFunction(code, bus, context)

		expect(fn(el)).toBe(30)
	})
})