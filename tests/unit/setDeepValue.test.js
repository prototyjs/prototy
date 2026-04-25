import { describe, it, expect, beforeEach } from 'vitest'
import { setDeepValue } from '@/utils/setDeepValue.js'

describe('setDeepValue', () => {
	let state

	beforeEach(() => {
		state = {
			user: {
				profile: {
					name: 'John'
				}
			}
		}
	})

	it('should update an existing value correctly', () => {
		setDeepValue(state, 'user.profile.name', 'Jane')
		expect(state.user.profile.name).toBe('Jane')
	})

	it('should not update if the value is already the same', () => {
		setDeepValue(state, 'user.profile.name', 'John')
		expect(state.user.profile.name).toBe('John')
	})

	it('should handle shallow paths', () => {
		setDeepValue(state, 'status', 'active')
		expect(state.status).toBe('active')
	})

	it('should identify the issue with invalid intermediate keys', () => {
		setDeepValue(state, 'user.wrong.name', 'New')

		expect(state.user.name).toBe('New')
		expect(state.user.profile.name).toBe('John')
	})
})