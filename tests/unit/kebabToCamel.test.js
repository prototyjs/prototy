import { describe, it, expect } from 'vitest'
import { kebabToCamel } from '@/utils/kebabToCamel.js'

describe('kebabToCamel', () => {
	it('should convert kebab-case to camelCase', () => {
		expect(kebabToCamel('background-color')).toBe('backgroundColor')
		expect(kebabToCamel('border-top-left-radius')).toBe('borderTopLeftRadius')
	})

	it('should handle strings without hyphens', () => {
		expect(kebabToCamel('test')).toBe('test')
		expect(kebabToCamel('alreadyCamelCase')).toBe('alreadyCamelCase')
	})

	it('should handle strings with multiple hyphens', () => {
		expect(kebabToCamel('my-long-variable-name')).toBe('myLongVariableName')
	})

	it('should not convert the first letter to uppercase', () => {
		expect(kebabToCamel('-start-with-hyphen')).toBe('StartWithHyphen')
	})
})