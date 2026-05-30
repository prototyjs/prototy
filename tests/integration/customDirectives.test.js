import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prototy, nextTick } from '@/index.js'

describe('Custom Directives - Limited tests', () => {
	beforeEach(() => {
		document.body.innerHTML = ''
	})

	it('should call custom directive', async () => {
		let called = false
		const customDirective = () => {
			called = true
		}

		document.body.innerHTML = '<div :custom="state.value"></div>'

		prototy({
			root: document.body,
			state: { value: 'test' },
			directives: { custom: customDirective }
		})

		await nextTick()
		expect(called).toBe(true)
	})

	it('should pass element as argument', async () => {
		let savedElement = null
		const customDirective = (el) => {
			savedElement = el
		}

		document.body.innerHTML = '<div id="test" :custom="state.value"></div>'

		prototy({
			root: document.body,
			state: { value: 'test' },
			directives: { custom: customDirective }
		})

		await nextTick()
		expect(savedElement).toBe(document.getElementById('test'))
	})

	it('should pass modifier name', async () => {
		let receivedModifier = null
		const customDirective = (el, val, modifier) => {
			receivedModifier = modifier
		}

		document.body.innerHTML = '<div :custom.reverse="state.value"></div>'

		prototy({
			root: document.body,
			state: { value: 'test' },
			directives: { custom: customDirective }
		})

		await nextTick()
		expect(receivedModifier).toBe('reverse')
	})

	it('should receive args array', async () => {
		let receivedArgs = null
		const customDirective = (el, val, modifier, args) => {
			receivedArgs = args
		}

		document.body.innerHTML = '<div :custom.repeat.3.times="state.value"></div>'

		prototy({
			root: document.body,
			state: { value: 'test' },
			directives: { custom: customDirective }
		})

		await nextTick()
		expect(Array.isArray(receivedArgs)).toBe(true)
	})

	it('should support multiple directives on same element', async () => {
		let d1Called = false
		let d2Called = false
		const d1 = () => {
			d1Called = true
		}
		const d2 = () => {
			d2Called = true
		}

		document.body.innerHTML = '<div :dir1="state.value" :dir2="state.value"></div>'

		prototy({
			root: document.body,
			state: { value: 'test' },
			directives: { dir1: d1, dir2: d2 }
		})

		await nextTick()
		expect(d1Called).toBe(true)
		expect(d2Called).toBe(true)
	})

	it('should allow setting attributes on element', async () => {
		const customDirective = (el) => {
			el.setAttribute('data-custom', 'works')
		}

		document.body.innerHTML = '<div :custom="state.value"></div>'

		prototy({
			root: document.body,
			state: { value: 'test' },
			directives: { custom: customDirective }
		})

		await nextTick()
		expect(document.body.firstElementChild.getAttribute('data-custom')).toBe('works')
	})

	it('should not override built-in text directive', async () => {
		const customText = vi.fn()

		document.body.innerHTML = '<div :text="state.value"></div>'

		prototy({
			root: document.body,
			state: { value: 'hello' },
			directives: { text: customText }
		})

		await nextTick()
		expect(customText).not.toHaveBeenCalled()
		expect(document.body.firstElementChild.textContent).toBe('hello')
	})
})