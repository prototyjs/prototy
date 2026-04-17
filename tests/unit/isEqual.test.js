import { describe, it, expect } from 'vitest'
import { isEqual } from '@/utils/isEqual.js'

describe('isEqual', () => {
	it('should return true for identical primitives', () => {
		expect(isEqual(1, 1)).toBe(true)
		expect(isEqual('test', 'test')).toBe(true)
		expect(isEqual(null, null)).toBe(true)
	})

	it('should return true for structurally identical objects and arrays', () => {
		expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
		expect(isEqual([1, 2, [3]], [1, 2, [3]])).toBe(true)
	})

	it('should return false for different objects', () => {
		expect(isEqual({ a: 1 }, { a: 2 })).toBe(false)
		expect(isEqual({ a: 1 }, { b: 1 })).toBe(false)
		expect(isEqual([1, 2], [1, 3])).toBe(false)
	})

	it('should be sensitive to property order', () => {
		const obj1 = { a: 1, b: 2 }
		const obj2 = { b: 2, a: 1 }
		expect(isEqual(obj1, obj2)).toBe(false)
	})
})