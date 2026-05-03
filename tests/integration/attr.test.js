import { describe, it, expect } from 'vitest'
import { attr } from '@/directives/attr.js'

describe('attr directive', () => {

	it('sets attribute when value is valid', () => {
		const element = document.createElement('div')

		attr(element, 'test-value', null, [], 'data-test')

		expect(element.getAttribute('data-test')).toBe('test-value')
	})

	it('removes attribute when value is null', () => {
		const element = document.createElement('div')
		element.setAttribute('data-test', 'old-value')

		attr(element, null, null, [], 'data-test')

		expect(element.hasAttribute('data-test')).toBe(false)
	})

	it('removes attribute when value is undefined', () => {
		const element = document.createElement('div')
		element.setAttribute('data-test', 'old-value')

		attr(element, undefined, null, [], 'data-test')

		expect(element.hasAttribute('data-test')).toBe(false)
	})

	it('removes attribute when value is false', () => {
		const element = document.createElement('div')
		element.setAttribute('data-test', 'old-value')

		attr(element, false, null, [], 'data-test')

		expect(element.hasAttribute('data-test')).toBe(false)
	})
})