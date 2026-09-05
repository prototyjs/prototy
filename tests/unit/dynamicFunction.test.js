import { describe, it, expect, vi } from 'vitest'
import { dynamicFunction } from '@/utils/dynamicFunction.js'

describe('dynamicFunction', () => {
	const bus = {
		state: { score: 10, user: { name: 'John' } },
		methods: {
			getScore: () => bus.state.score
		},
		params: { version: '1.0' },
		root: document.body,
		components: { card: 'Card' },
		els: { header: document.createElement('header') }
	}
	const el = document.createElement('div')
	const localEls = { button: document.createElement('button') }

	it('should execute basic code using bus context', () => {
		const code = 'score * 2'
		const fn = dynamicFunction(code, bus, null)  // ← null
		expect(fn(el, {})).toBe(20)
	})

	it('should inject local value using the provided key', () => {
		const code = 'val + "!"'
		const fn = dynamicFunction(code, bus, null, 'val')  // ← null
		expect(fn(el, {}, 'hello')).toBe('hello!')
	})

	it('should correctly merge bus and dynamic context from DOM', () => {
		const code = 'score * multiplier'
		const fn = dynamicFunction(code, bus, null)  // ← null

		const dynamicContext = { multiplier: 3 }
		expect(fn(el, dynamicContext)).toBe(30)
	})

	it('should support item and index from context', () => {
		const code = 'item + "_" + index'
		const fn = dynamicFunction(code, bus, null)  // ← null

		const dynamicContext = { item: 'test', index: 5 }
		expect(fn(el, dynamicContext)).toBe('test_5')
	})

	it('should handle event variable for listeners', () => {
		const code = 'event.type'
		const fn = dynamicFunction(code, bus, null, 'event')  // ← null

		const mockEvent = { type: 'click' }
		expect(fn(el, {}, mockEvent)).toBe('click')
	})

	it('should provide el variable', () => {
		const code = 'el.tagName'
		const fn = dynamicFunction(code, bus, null)  // ← null

		expect(fn(el, {})).toBe('DIV')
	})

	it('should access params', () => {
		const code = 'version'
		const fn = dynamicFunction(code, bus, null)  // ← null

		expect(fn(el, {})).toBe('1.0')
	})

	it('should access methods', () => {
		const code = 'getScore()'
		const fn = dynamicFunction(code, bus, null)  // ← null

		expect(fn(el, {})).toBe(10)
	})

	it('should access components', () => {
		const code = 'components.card'
		const fn = dynamicFunction(code, bus, null)  // ← null

		expect(fn(el, {})).toBe('Card')
	})

	it('should access global els', () => {
		const code = 'els.header.tagName'
		const fn = dynamicFunction(code, bus, bus.els)  // ← null

		expect(fn(el, {})).toBe('HEADER')
	})

	it('should use local els when provided', () => {
		const code = 'els.button.tagName'
		const fn = dynamicFunction(code, bus, localEls)  // ← localEls

		expect(fn(el, {})).toBe('BUTTON')
	})

	it('should prioritize context over state', () => {
		const code = 'score'
		const fn = dynamicFunction(code, bus, null)  // ← null

		const dynamicContext = { score: 999 }
		expect(fn(el, dynamicContext)).toBe(999)
	})

	it('should prioritize state over params', () => {
		const testBus = {
			...bus,
			state: { version: '2.0' },
			params: { version: '1.0' }
		}
		const code = 'version'
		const fn = dynamicFunction(code, testBus, null)  // ← null

		expect(fn(el, {})).toBe('2.0')
	})

	it('should allow writing to item', () => {
		const code = 'item.name = "New Name"'
		const fn = dynamicFunction(code, bus, null)  // ← null
		const context = { item: { name: 'Old Name' } }

		fn(el, context)
		expect(context.item.name).toBe('New Name')
	})

	it('should allow writing to props', () => {
		const code = 'props.title = "New Title"'
		const fn = dynamicFunction(code, bus, null)  // ← null
		const context = { props: { title: 'Old Title' } }

		fn(el, context)
		expect(context.props.title).toBe('New Title')
	})

	it('should allow writing to state', () => {
		const code = 'score = 100'
		const fn = dynamicFunction(code, bus, null)  // ← null

		fn(el, {})
		expect(bus.state.score).toBe(100)
	})

	it('should execute complex expressions', () => {
		const code = 'score > 5 ? "high" : "low"'
		const fn = dynamicFunction(code, bus, null)  // ← null

		expect(fn(el, {})).toBe('high')

		bus.state.score = 3
		expect(fn(el, {})).toBe('low')
	})

	it('should work with nested objects', () => {
		const code = 'user.name'
		const fn = dynamicFunction(code, bus, null)  // ← null

		expect(fn(el, {})).toBe('John')
	})

	it('should work with template literals', () => {
		const code = '`Hello, ${user.name}!`'
		const fn = dynamicFunction(code, bus, null)  // ← null

		expect(fn(el, {})).toBe('Hello, John!')
	})

	it('should work with function calls in expressions', () => {
		const testBus = {
			...bus,
			methods: {
				greet(name) {
					return `Hello, ${name}!`
				}
			}
		}
		const code = 'greet(user.name)'
		const fn = dynamicFunction(code, testBus, null)  // ← null

		expect(fn(el, {})).toBe('Hello, John!')
	})

	it('should work with method calls that use this', () => {
		const testBus = {
			...bus,
			state: { count: 5 },
			methods: {
				getCount() {
					return testBus.state.count
				},
				increment() {
					testBus.state.count++
				}
			}
		}

		const code = 'getCount()'
		const fn = dynamicFunction(code, testBus, null)  // ← null

		expect(fn(el, {})).toBe(5)

		const code2 = 'increment()'
		const fn2 = dynamicFunction(code2, testBus, null)  // ← null
		fn2(el, {})
		expect(testBus.state.count).toBe(6)
	})
})