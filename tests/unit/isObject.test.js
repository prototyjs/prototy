import { describe, it, expect } from 'vitest'
import { isObject } from '@/utils/isObject.js'

describe('isObject', () => {
	it('should return true for objects', () => {
		expect(isObject({})).toBe(true)
		expect(isObject({ a: 1 })).toBe(true)
		expect(isObject(new Object())).toBe(true)
	})

	it('should return true for arrays (since they are objects in JS)', () => {
		expect(isObject([])).toBe(true)
	})

	it('should return false for null', () => {
		expect(isObject(null)).toBe(false)
	})

	it('should return false for primitives', () => {
		expect(isObject(undefined)).toBe(false)
		expect(isObject(42)).toBe(false)
		expect(isObject('string')).toBe(false)
		expect(isObject(true)).toBe(false)
		expect(isObject(Symbol('foo'))).toBe(false)
	})

	it('should return false for functions', () => {
		expect(isObject(() => {})).toBe(false)
	})
})