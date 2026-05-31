import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prototy, nextTick } from '@'

describe('Event Listeners', () => {
	beforeEach(() => {
		document.body.innerHTML = ''
	})

	describe('Basic events', () => {
		it('should handle click event', async () => {
			document.body.innerHTML = '<button :onclick="count++" :text="count"></button>'
			prototy({
				root: document.body,
				state: { count: 0 }
			})

			const button = document.body.firstElementChild
			expect(button.textContent).toBe('0')

			button.click()
			await nextTick()
			expect(button.textContent).toBe('1')
		})

		it('should handle multiple events on same element', async () => {
			document.body.innerHTML = `
                <button
                    :onclick="count++"
                    :onmouseenter="hover = true"
                    :onmouseleave="hover = false"
                    :text="count"
                ></button>
            `
			const app = prototy({
				root: document.body,
				state: { count: 0, hover: false }
			})

			const button = document.body.firstElementChild

			button.click()
			await nextTick()
			expect(button.textContent).toBe('1')

			button.dispatchEvent(new MouseEvent('mouseenter'))
			await nextTick()
			expect(app.state.hover).toBe(true)

			button.dispatchEvent(new MouseEvent('mouseleave'))
			await nextTick()
			expect(app.state.hover).toBe(false)
		})

		it('should handle custom events', async () => {
			document.body.innerHTML = '<div :text="status"></div>'
			const app = prototy({
				root: document.body,
				state: { status: 'waiting' },
				methods: {
					onCustomEvent() {
						app.state.status = 'triggered'
					}
				}
			})

			const div = document.body.firstElementChild
			div.addEventListener('custom-event', () => app.methods.onCustomEvent())
			div.dispatchEvent(new CustomEvent('custom-event'))
			await nextTick()
			expect(div.textContent).toBe('triggered')
		})
	})

	describe('Event modifiers', () => {
		it('should handle .stop modifier', async () => {
			document.body.innerHTML = `
        <div :onclick="parentClicked = true">
            <span :text="'Parent clicked: ' + parentClicked"></span>
            <button :onclick.stop="childClicked++" :text="childClicked"></button>
        </div>
    `
			const app = prototy({
				root: document.body,
				state: { childClicked: 0, parentClicked: false }
			})

			const button = app.root.querySelector('button')
			expect(button).not.toBeNull()

			button.click()
			await nextTick()

			expect(app.state.childClicked).toBe(1)
			expect(app.state.parentClicked).toBe(false)
		})

		it('should handle .prevent modifier', async () => {
			document.body.innerHTML = `
                <form>
                    <button :onclick.prevent="submitted = true" :text="'Submit'"></button>
                </form>
            `
			const app = prototy({
				root: document.body,
				state: { submitted: false }
			})

			const button = document.body.firstElementChild.firstElementChild
			const event = new MouseEvent('click', { cancelable: true })
			const prevented = !button.dispatchEvent(event)

			expect(prevented).toBe(true)
			await nextTick()
			expect(app.state.submitted).toBe(true)
		})

		it('should handle .self modifier', async () => {
			document.body.innerHTML = `
        <div :onclick.self="divClicked = true">
            <span :text="'Parent Div'"></span>
            <button :onclick="buttonClicked = true" :text="'Click me'"></button>
        </div>
    `
			const app = prototy({
				root: document.body,
				state: { divClicked: false, buttonClicked: false }
			})

			const div = app.root.querySelector('div')
			const button = app.root.querySelector('button')

			button.click()
			await nextTick()
			expect(app.state.divClicked).toBe(false)
			expect(app.state.buttonClicked).toBe(true)

			app.state.buttonClicked = false

			div.click()
			await nextTick()
			expect(app.state.divClicked).toBe(true)
		})

		it('should handle .once modifier', async () => {
			document.body.innerHTML = '<button :onclick.once="count++" :text="count"></button>'
			prototy({
				root: document.body,
				state: { count: 0 }
			})

			const button = document.body.firstElementChild

			button.click()
			await nextTick()
			expect(button.textContent).toBe('1')

			button.click()
			await nextTick()
			expect(button.textContent).toBe('1')
		})

		it('should handle .enter modifier', async () => {
			document.body.innerHTML = '<input :onkeydown.enter="submitted = value" />'
			const app = prototy({
				root: document.body,
				state: { value: '', submitted: null }
			})

			const input = document.body.firstElementChild
			input.value = 'hello'
			app.state.value = 'hello'

			input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }))
			await nextTick()
			expect(app.state.submitted).toBe(null)

			input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
			await nextTick()
			expect(app.state.submitted).toBe('hello')
		})

		it('should handle .capture modifier', async () => {
			let capturePhase = false
			let bubblePhase = false

			document.body.innerHTML = `
                <div :onclick.capture="capture = true" :text="'parent'">
                    <button :onclick="bubble = true" :text="'button'"></button>
                </div>
            `

			const div = document.body.firstElementChild
			const button = div.firstElementChild

			// Test with capture
			div.addEventListener('click', () => {
 				capturePhase = true
			}, true)
			button.addEventListener('click', () => {
				bubblePhase = true
			})

			button.click()
			expect(capturePhase).toBe(true)
			expect(bubblePhase).toBe(true)
		})

		it('should handle .passive modifier', async () => {
			document.body.innerHTML = '<div :onscroll.passive="scrolled = true" :text="\'scrollable\'" style="height:100px;overflow:auto"></div>'
			const app = prototy({
				root: document.body,
				state: { scrolled: false }
			})

			const div = document.body.firstElementChild
			// Add content to make scrollable
			div.innerHTML = '<div style="height:200px"></div>'

			div.dispatchEvent(new Event('scroll'))
			await nextTick()
			expect(app.state.scrolled).toBe(true)
		})

		it('should handle multiple modifiers together', async () => {
			document.body.innerHTML = `
        <div>
            <button :onclick.stop.prevent.once="childClicked++" :text="childClicked"></button>
        </div>
    `
			const app = prototy({
				root: document.body,
				state: { childClicked: 0 }
			})

			const button = app.root.querySelector('button')
			expect(button).not.toBeNull()

			button.click()
			await nextTick()
			expect(app.state.childClicked).toBe(1)

			button.click()
			await nextTick()
			expect(app.state.childClicked).toBe(1) // .once prevented
		})
	})
	describe('Event object access', () => {
		it('should provide $event in expression', async () => {
			document.body.innerHTML = '<button :onclick="lastEventType = event.type" :text="lastEventType"></button>'
			prototy({
				root: document.body,
				state: { lastEventType: '' }
			})

			const button = document.body.firstElementChild
			button.click()
			await nextTick()
			expect(button.textContent).toBe('click')
		})

		it('should access event properties', async () => {
			document.body.innerHTML = '<input :oninput="inputValue = event.target.value" />'
			const app = prototy({
				root: document.body,
				state: { inputValue: '' }
			})

			const input = document.body.firstElementChild
			input.value = 'test'
			input.dispatchEvent(new Event('input'))
			await nextTick()
			expect(app.state.inputValue).toBe('test')
		})
	})

	describe('Dynamic event handlers', () => {
		it('should work with methods', async () => {
			document.body.innerHTML = '<button :onclick="increment()" :text="count"></button>'
			prototy({
				root: document.body,
				state: { count: 0 },
				methods: {
					increment() {
						this.state.count++
					}
				}
			})

			const button = document.body.firstElementChild
			expect(button.textContent).toBe('0')

			button.click()
			await nextTick()
			expect(button.textContent).toBe('1')
		})

		it('should pass parameters to methods', async () => {
			document.body.innerHTML = '<button :onclick="add(5)" :text="count"></button>'
			prototy({
				root: document.body,
				state: { count: 0 },
				methods: {
					add(value) {
						this.state.count += value
					}
				}
			})

			const button = document.body.firstElementChild
			button.click()
			await nextTick()
			expect(button.textContent).toBe('5')
		})

		it('should work with inline expressions', async () => {
			document.body.innerHTML = '<button :onclick="count = count + 2" :text="count"></button>'
			prototy({
				root: document.body,
				state: { count: 0 }
			})

			const button = document.body.firstElementChild
			button.click()
			await nextTick()
			expect(button.textContent).toBe('2')
		})
	})

	describe('Cleanup', () => {
		it('should remove event listeners on destroy', async () => {
			const removeEventListenerSpy = vi.spyOn(HTMLElement.prototype, 'removeEventListener')

			document.body.innerHTML = '<button :onclick="count++" :text="count"></button>'
			const app = prototy({
				root: document.body,
				state: { count: 0 }
			})

			const button = document.body.firstElementChild

			// Manually trigger destroy
			app.destroy(button)

			expect(removeEventListenerSpy).toHaveBeenCalled()
			removeEventListenerSpy.mockRestore()
		})

		it('should not trigger events after element removal', async () => {
			document.body.innerHTML = '<button :onclick="count++" :text="count"></button>'
			const app = prototy({
				root: document.body,
				state: { count: 0 }
			})

			const button = document.body.firstElementChild
			app.destroy(button)

			button.click()
			await nextTick()
			expect(app.state.count).toBe(0)
		})
	})
})