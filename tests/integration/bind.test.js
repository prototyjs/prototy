import { describe, it, expect, beforeEach, afterEach, vi  } from 'vitest'
import { prototy, nextTick } from '@'

describe('Bind Directive Variations', () => {

	it('should update DOM when state changes (State -> DOM)', async () => {
		document.body.innerHTML = '<input :bind.value.input="state.text">'
		const app = prototy({
			root: document.body,
			state: { text: 'start' }
		})
		const input = document.body.firstElementChild
		expect(input.value).toBe('start')

		app.state.text = 'end'
		await nextTick()
		expect(input.value).toBe('end')

		app.state.text = null
		await nextTick()
		expect(input.value).toBe('')
	})

	it('should sync text input and apply trim', async () => {
		document.body.innerHTML = '<input type="text" :bind.value.input.trim="state.username">'

		const app = prototy({
			root: document.body,
			state: { username: 'admin' }
		})
		const input = document.body.firstElementChild

		input.value = '   user123   '
		input.dispatchEvent(new Event('input'))

		await nextTick()
		expect(app.state.username).toBe('user123')
	})

	it('should sync checkbox state via checked property', async () => {
		document.body.innerHTML = '<input type="checkbox" :bind.checked.change="state.active">'

		const app = prototy({
			root: document.body,
			state: { active: false }
		})
		const checkbox = document.body.firstElementChild

		expect(checkbox.checked).toBe(false)

		checkbox.checked = true
		checkbox.dispatchEvent(new Event('change'))

		await nextTick()
		expect(app.state.active).toBe(true)
	})
})

describe('Bind Directive Debounce Modifier', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should debounce state update with .debounce.500 modifier', async () => {
		document.body.innerHTML = '<input :bind.value.input.debounce.500="state.search">'

		const app = prototy({
			root: document.body,
			state: { search: '' }
		})
		const input = document.body.firstElementChild

		input.value = 'h'
		input.dispatchEvent(new Event('input'))
		input.value = 'he'
		input.dispatchEvent(new Event('input'))
		input.value = 'hel'
		input.dispatchEvent(new Event('input'))

		expect(app.state.search).toBe('')

		vi.advanceTimersByTime(200)
		expect(app.state.search).toBe('')

		vi.advanceTimersByTime(300)

		await nextTick()

		expect(app.state.search).toBe('hel')
	})
})