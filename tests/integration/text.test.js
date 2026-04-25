import { describe, it, expect, beforeEach } from 'vitest'
import { prototy, nextTick } from '@'

describe('Text Directive', () => {
	beforeEach(() => {
		document.body.innerHTML = ''
	})

	it('should update text after state change', async () => {
		document.body.innerHTML = '<div :text="state.value"></div>'
		const app = prototy({
			root: document.body,
			state: { value: 1 }
		})

		expect(document.body.firstElementChild.textContent).toBe('1')
		app.state.value++
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('2')
	})

	it('should handle null and undefined values', async () => {
		document.body.innerHTML = '<div :text="state.value"></div>'
		const app = prototy({
			root: document.body,
			state: { value: 'hello' }
		})

		expect(document.body.firstElementChild.textContent).toBe('hello')
		app.state.value = null
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('')
		app.state.value = undefined
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('')
	})

	it('should convert numbers to strings', async () => {
		document.body.innerHTML = '<div :text="state.value"></div>'
		const app = prototy({
			root: document.body,
			state: { value: 42 }
		})

		expect(document.body.firstElementChild.textContent).toBe('42')
		app.state.value = 0
		await nextTick()
		expect(document.body.firstElementChild.textContent).toBe('0')
	})

	it('should handle boolean values', async () => {
		document.body.innerHTML = '<div :text="state.value"></div>'

		const app = prototy({
			root: document.body,
			state: { value: false }
		})

		expect(document.body.firstElementChild.textContent).toBe('false')

		app.state.value = true

		await nextTick()

		expect(document.body.firstElementChild.textContent).toBe('true')
	})

	describe('modifiers', () => {
		it('should apply fixed modifier', async () => {
			document.body.innerHTML = '<div :text.fixed.2="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: 42.5678 }
			})
			expect(document.body.firstElementChild.textContent).toBe('42.57')

			document.body.innerHTML = '<div :text.fixed.3="state.value"></div>'
			const appWith3 = prototy({
				root: document.body,
				state: { value: 42.5678 }
			})
			expect(document.body.firstElementChild.textContent).toBe('42.568')
		})

		it('should apply upper modifier', async () => {
			document.body.innerHTML = '<div :text.upper="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: 'hello world' }
			})
			expect(document.body.firstElementChild.textContent).toBe('HELLO WORLD')
			app.state.value = 'Test'
			await nextTick()
			expect(document.body.firstElementChild.textContent).toBe('TEST')
		})

		it('should apply lower modifier', async () => {
			document.body.innerHTML = '<div :text.lower="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: 'HELLO WORLD' }
			})
			expect(document.body.firstElementChild.textContent).toBe('hello world')
		})

		it('should apply trim modifier', async () => {
			document.body.innerHTML = '<div :text.trim="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: '  hello  ' }
			})
			expect(document.body.firstElementChild.textContent).toBe('hello')
		})

		it('should apply capitalize modifier', async () => {
			document.body.innerHTML = '<div :text.capitalize="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: 'hello world' }
			})
			expect(document.body.firstElementChild.textContent).toBe('Hello world')
			app.state.value = 'test'
			await nextTick()
			expect(document.body.firstElementChild.textContent).toBe('Test')
		})

		it('should apply default modifier', async () => {
			document.body.innerHTML = '<div :text.default="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: null }
			})
			expect(document.body.firstElementChild.textContent).toBe('-')

			document.body.innerHTML = '<div :text.default.empty="state.value"></div>'
			const appWithCustomDefault = prototy({
				root: document.body,
				state: { value: null }
			})
			expect(document.body.firstElementChild.textContent).toBe('empty')
		})

		it('should apply json modifier', async () => {
			document.body.innerHTML = '<div :text.json="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: { name: 'John', age: 30 } }
			})
			expect(document.body.firstElementChild.textContent).toBe('{"name":"John","age":30}')
		})

		it('should apply int modifier', async () => {
			document.body.innerHTML = '<div :text.int="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: '42.7' }
			})
			expect(document.body.firstElementChild.textContent).toBe('42')

			document.body.innerHTML = '<div :text.int.16="state.value"></div>'
			const appWithRadix = prototy({
				root: document.body,
				state: { value: 'FF' }
			})
			expect(document.body.firstElementChild.textContent).toBe('255')
		})

		it('should apply abs modifier', async () => {
			document.body.innerHTML = '<div :text.abs="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: -42 }
			})
			expect(document.body.firstElementChild.textContent).toBe('42')
		})

		it('should apply round modifier', async () => {
			document.body.innerHTML = '<div :text.round="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: 42.7 }
			})
			expect(document.body.firstElementChild.textContent).toBe('43')
		})

		it('should apply clamp modifier', async () => {
			document.body.innerHTML = '<div :text.clamp="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: 1.5 }
			})
			expect(document.body.firstElementChild.textContent).toBe('1')

			document.body.innerHTML = '<div :text.clamp.0.100="state.value"></div>'
			const appWithBounds = prototy({
				root: document.body,
				state: { value: 150 }
			})
			expect(document.body.firstElementChild.textContent).toBe('100')
		})

		it('should apply unit modifier', async () => {
			document.body.innerHTML = '<div :text.unit="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: 42 }
			})
			expect(document.body.firstElementChild.textContent).toBe('42px')

			document.body.innerHTML = '<div :text.unit.em="state.value"></div>'
			const appWithUnit = prototy({
				root: document.body,
				state: { value: 42 }
			})
			expect(document.body.firstElementChild.textContent).toBe('42em')
		})

		it('should chain multiple modifiers', async () => {
			document.body.innerHTML = '<div :text.upper.trim="state.value"></div>'
			const app = prototy({
				root: document.body,
				state: { value: '  hello world  ' }
			})
			expect(document.body.firstElementChild.textContent).toBe('HELLO WORLD')
		})
	})
})
