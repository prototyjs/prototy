import { describe, it, expect } from 'vitest'
import { bindMethods } from '@/utils/bindMethods.js'

describe('bindMethods', () => {
	it('should bind functions and ignore other types', () => {
		const target = {}
		const context = { value: 'ok' }
		const source = {
			test() {
				return this.value
			},
			data: 123
		}

		bindMethods(target, source, context)

		expect(target.test()).toBe('ok')
		expect(target.data).toBeUndefined()
	})

	it('should handle empty or null source', () => {
		const target = {}
		bindMethods(target, null, {})
		expect(target).toEqual({})
	})
})