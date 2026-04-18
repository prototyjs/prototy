import { describe, it, expect } from 'vitest'
import { mapComponents } from '@/component/mapComponents.js'

describe('mapComponents', () => {
	it('should transform template strings into component objects', () => {
		const input = {
			MyButton: '<button>Click</button>',
			MyInput: '<input />'
		}

		const result = mapComponents(input)

		expect(result).toEqual({
			MyButton: { name: 'MyButton', template: '<button>Click</button>' },
			MyInput: { name: 'MyInput', template: '<input />' }
		})
	})

	it('should return an empty object if input is empty', () => {
		expect(mapComponents({})).toEqual({})
		expect(mapComponents(undefined)).toEqual({})
	})

	it('should preserve keys as the name property', () => {
		const input = { 'custom-element': '<div></div>' }
		const result = mapComponents(input)

		expect(result['custom-element'].name).toBe('custom-element')
	})
})