import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prototy, nextTick } from '@'

describe('Computed Properties', () => {
	const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
	const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

	beforeEach(() => {
		consoleSpy.mockClear()
		consoleWarnSpy.mockClear()
		document.body.innerHTML = ''
	})

	it('should compute value based on state', async () => {
		document.body.innerHTML = '<div :text="double"></div>'

		const app = prototy({
			root: document.body,
			state: { value: 5 },
			computed: {
				double() {
					return this.state.value * 2
				}
			}
		})

		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('10')

		app.state.value = 10
		await nextTick()

		expect(document.body.firstElementChild.textContent).toBe('20')
	})

	it('should cache computed values', async () => {
		let computeCount = 0

		const app = prototy({
			root: document.body,
			state: { value: 5 },
			computed: {
				double() {
					computeCount++
					return this.state.value * 2
				}
			}
		})

		expect(app.state.double).toBe(10)
		expect(app.state.double).toBe(10)
		expect(app.state.double).toBe(10)

		expect(computeCount).toBe(1)

		app.state.value = 10
		await nextTick()

		expect(app.state.double).toBe(20)
		expect(computeCount).toBe(2)
	})

	it('should work with multiple computed properties', async () => {
		document.body.innerHTML = `
			<span :text="sum"></span>
			<span :text="product"></span>
			<span :text="average"></span>
		`

		const app = prototy({
			root: document.body,
			state: { a: 10, b: 20, c: 30 },
			computed: {
				sum() {
					return this.state.a + this.state.b + this.state.c
				},
				product() {
					return this.state.a * this.state.b * this.state.c
				},
				average() {
					return this.state.sum / 3
				}
			}
		})

		await nextTick()
		const [sumSpan, productSpan, avgSpan] = document.body.children

		expect(sumSpan.textContent).toBe('60')
		expect(productSpan.textContent).toBe('6000')
		expect(avgSpan.textContent).toBe('20')

		app.state.a = 5
		await nextTick()

		expect(sumSpan.textContent).toBe('55')
		expect(productSpan.textContent).toBe('3000')
		expect(avgSpan.textContent).toBe('18.333333333333332')
	})

	it('should depend on other computed properties', async () => {
		document.body.innerHTML = '<div :text="quadruple"></div>'

		const app = prototy({
			root: document.body,
			state: { value: 5 },
			computed: {
				double() {
					return this.state.value * 2
				},
				quadruple() {
					return this.state.double * 2
				}
			}
		})

		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('20')

		app.state.value = 10
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('40')
	})

	it('should be readonly', async () => {
		const app = prototy({
			root: document.body,
			state: { value: 5 },
			computed: {
				double() {
					return this.state.value * 2
				}
			}
		})

		expect(() => {
			app.state.double = 100
		}).toThrow()

		expect(app.state.double).toBe(10)
	})

	it('should handle errors in computed', async () => {
		const app = prototy({
			root: document.body,
			state: { value: 5 },
			computed: {
				error() {
					throw new Error('Computed error')
				}
			}
		})

		expect(() => {
			app.state.error
		}).not.toThrow()

		expect(consoleSpy).toHaveBeenCalled()
		expect(consoleSpy.mock.calls[0][0]).toContain('Error in computed property "error"')
	})

	it('should warn when computed overrides existing property', async () => {
		const app = prototy({
			root: document.body,
			state: { value: 5, double: 100 },
			computed: {
				double() {
					return this.state.value * 2
				}
			}
		})

		expect(consoleWarnSpy).toHaveBeenCalled()
		expect(consoleWarnSpy.mock.calls[0][0]).toContain('overrides existing property')
		expect(app.state.double).toBe(10)
	})

	it('should work with deep state paths', async () => {
		document.body.innerHTML = '<div :text="fullName"></div>'

		const app = prototy({
			root: document.body,
			state: {
				user: {
					firstName: 'John',
					lastName: 'Doe'
				}
			},
			computed: {
				fullName() {
					return `${this.state.user.firstName} ${this.state.user.lastName}`
				}
			}
		})

		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('John Doe')

		app.state.user.firstName = 'Jane'
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('Jane Doe')
	})

	it('should work with methods in computed', async () => {
		document.body.innerHTML = '<div :text="greeting"></div>'

		let called = false

		prototy({
			root: document.body,
			state: { name: 'World' },
			methods: {
				sayHello(name) {
					called = true
					return `Hello ${name}!`
				}
			},
			computed: {
				greeting() {
					return this.methods.sayHello(this.state.name)
				}
			}
		})

		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('Hello World!')
		expect(called).toBe(true)
	})

	it('should update UI when computed dependencies change', async () => {
		document.body.innerHTML = `
			<div :text="message"></div>
			<button :onclick="count++">Increment</button>
		`

		const app = prototy({
			root: document.body,
			state: { count: 1 },
			computed: {
				message() {
					return `Count is ${this.state.count}`
				}
			}
		})

		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('Count is 1')

		app.state.count++
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('Count is 2')
	})

	it('should work with array dependencies', async () => {
		document.body.innerHTML = '<div :text="firstItem"></div>'

		const app = prototy({
			root: document.body,
			state: { items: [10, 20, 30] },
			computed: {
				firstItem() {
					return this.state.items[0]
				}
			}
		})

		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('10')

		app.state.items[0] = 100
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('100')
	})

	it('should work with array length changes', async () => {
		document.body.innerHTML = '<div :text="itemCount"></div>'

		const app = prototy({
			root: document.body,
			state: { items: [1, 2, 3] },
			computed: {
				itemCount() {
					return this.state.items.length
				}
			}
		})

		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('3')

		app.state.items.push(4)
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('4')
	})

	it('should work with object property addition', async () => {
		document.body.innerHTML = '<div :text="hasEmail"></div>'

		const app = prototy({
			root: document.body,
			state: { user: { name: 'John' } },
			computed: {
				hasEmail() {
					return this.state.user.email ? 'yes' : 'no'
				}
			}
		})

		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('no')

		app.state.user.email = 'john@example.com'
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('yes')
	})

	it('should work with multiple deep paths', async () => {
		document.body.innerHTML = '<div :text="fullInfo"></div>'

		const app = prototy({
			root: document.body,
			state: {
				user: {
					personal: { firstName: 'John', lastName: 'Doe' },
					address: { city: 'NYC', country: 'USA' }
				}
			},
			computed: {
				fullInfo() {
					return `${this.state.user.personal.firstName} ${this.state.user.personal.lastName} from ${this.state.user.address.city}`
				}
			}
		})

		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('John Doe from NYC')

		app.state.user.personal.firstName = 'Jane'
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('Jane Doe from NYC')

		app.state.user.address.city = 'LA'
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('Jane Doe from LA')
	})

	it('should not recalculate when unrelated state changes', async () => {
		let computeCount = 0

		document.body.innerHTML = '<div :text="double"></div>'

		const app = prototy({
			root: document.body,
			state: { value: 5, unrelated: 100 },
			computed: {
				double() {
					computeCount++
					return this.state.value * 2
				}
			}
		})

		await nextTick()
		expect(computeCount).toBe(1)

		app.state.unrelated = 200
		await nextTick()
		expect(computeCount).toBe(1)

		app.state.value = 10
		await nextTick()
		expect(computeCount).toBe(2)
	})
})