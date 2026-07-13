import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prototy } from '@/index'

describe('Setters with shorthand syntax', () => {
	const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

	beforeEach(() => {
		consoleSpy.mockClear()
	})

	it('should validate and transform nested paths', () => {
		const app = prototy({
			state: {
				product: {
					count: 0,
					price: 0,
					name: ''
				}
			},
			setters: {
				'product.count'(value) {
					return Math.max(0, value)
				},
				'product.price'(value) {
					return Math.round(value * 100) / 100
				},
				'product.name'(value) {
					return value.trim().toUpperCase()
				}
			}
		})

		app.state.product.count = -5
		app.state.product.price = 99.999
		app.state.product.name = '  macbook pro  '

		expect(app.state.product.count).toBe(0)
		expect(app.state.product.price).toBe(100)
		expect(app.state.product.name).toBe('MACBOOK PRO')
		expect(consoleSpy).not.toHaveBeenCalled()
	})

	it('should handle validation errors gracefully', () => {
		const app = prototy({
			state: {
				user: {
					age: 25,
					email: 'test@test.com'
				}
			},
			setters: {
				'user.age'(value) {
					if (value < 0 || value > 150) {
						throw new Error('Age must be between 0 and 150')
					}
					return Math.floor(value)
				},
				'user.email'(value) {
					if (!value.includes('@')) {
						throw new Error('Invalid email format')
					}
					return value.toLowerCase().trim()
				}
			}
		})

		app.state.user.age = 30.7
		expect(app.state.user.age).toBe(30)

		app.state.user.email = '  JOHN@TEST.COM  '
		expect(app.state.user.email).toBe('john@test.com')

		app.state.user.age = 200
		expect(consoleSpy).toHaveBeenCalled()
		expect(app.state.user.age).toBe(30)

		consoleSpy.mockClear()
		app.state.user.email = 'invalid'
		expect(consoleSpy).toHaveBeenCalled()
		expect(app.state.user.email).toBe('john@test.com')
	})

	it('should access this context in setters', () => {
		const app = prototy({
			state: {
				firstName: 'John',
				lastName: 'Doe',
				fullName: ''
			},
			params: {
				maxLength: 50
			},
			setters: {
				'fullName'(value) {
					const [first, last] = value.split(' ')
					this.state.firstName = first
					this.state.lastName = last || ''
					return value.length > this.params.maxLength
						? value.slice(0, this.params.maxLength)
						: value
				}
			}
		})

		app.state.fullName = 'Jane Smith'
		expect(app.state.firstName).toBe('Jane')
		expect(app.state.lastName).toBe('Smith')
		expect(app.state.fullName).toBe('Jane Smith')

		const longName = 'VeryVeryLongNameThatExceedsFiftyCharactersLimitXXX'
		app.state.fullName = longName
		expect(app.state.fullName.length).toBe(50)
	})

	it('should work with computed properties', () => {
		const app = prototy({
			state: {
				product: {
					count: 0,
					price: 0
				}
			},
			computed: {
				total() {
					return this.state.product.count * this.state.product.price
				}
			},
			setters: {
				'product.count'(value) {
					return Math.max(0, value)
				},
				'product.price'(value) {
					return Math.max(0, value)
				}
			}
		})

		app.state.product.count = 5
		app.state.product.price = 100

		expect(app.state.total).toBe(500)
	})

	it('should handle array indices', () => {
		const app = prototy({
			state: {
				scores: [0, 0, 0]
			},
			setters: {
				'scores.0'(value) {
					return Math.min(100, Math.max(0, value))
				},
				'scores.1'(value) {
					return Math.min(100, Math.max(0, value))
				},
				'scores.2'(value) {
					return Math.min(100, Math.max(0, value))
				}
			}
		})

		app.state.scores[0] = 150
		app.state.scores[1] = -10
		app.state.scores[2] = 75

		expect(app.state.scores[0]).toBe(100)
		expect(app.state.scores[1]).toBe(0)
		expect(app.state.scores[2]).toBe(75)
	})
})