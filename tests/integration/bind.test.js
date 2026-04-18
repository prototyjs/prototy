import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prototy, nextTick } from '@'

describe('Bind Directive Variations', () => {

	const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

	beforeEach(() => {
		consoleSpy.mockClear()
	})

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

	it('should prevent overwriting oninput (Monopoly check)', async () => {
		document.body.innerHTML = '<input :bind.value.input="state.text">'
		const app = prototy({ root: document.body, state: { text: 'val' } })
		const input = document.body.firstElementChild

		input.oninput = () => {
			app.state.text = 'hacked'
		}

		input.value = 'new'
		input.dispatchEvent(new Event('input'))
		await nextTick()

		const lastLogMessage = consoleSpy.mock.lastCall[0]
		expect(lastLogMessage).toContain('[PROTOTY] Channel "oninput" is occupied by bind "state.text".')

		expect(app.state.text).not.toBe('hacked')
	})

	it('should log error on conflicting bindings', async () => {
		document.body.innerHTML = '<input :bind.value.input="state.a" :bind.checked.input="state.b">'

		prototy({ root: document.body, state: { a: '', b: false } })

		const lastLogMessage = consoleSpy.mock.lastCall[0]
		expect(lastLogMessage).toContain('[PROTOTY] Conflict "oninput" already taken by "value".')
	})

	it('should cleanup property on element removal', async () => {
		document.body.innerHTML = '<div id="parent"><input :bind.value.input="state.text"></div>'
		prototy({ root: document.body, state: { text: 'abc' } })
		const input = document.querySelector('input')

		input.oninput = () => {}
		expect(consoleSpy).toHaveBeenCalledTimes(1)
		consoleSpy.mockClear()

		input.remove()
		await nextTick()

		input.oninput = () => {}

		expect(consoleSpy).not.toHaveBeenCalled()

		expect(input._bound).toBeUndefined()
	})

	it('should handle deep state paths', async () => {
		document.body.innerHTML = '<input :bind.value.input="state.user.profile.name">'
		const app = prototy({
			root: document.body,
			state: { user: { profile: { name: 'John' } } }
		})
		const input = document.body.firstElementChild

		input.value = 'Doe'
		input.dispatchEvent(new Event('input'))
		await nextTick()

		expect(app.state.user.profile.name).toBe('Doe')
	})

	it('should log error if path does not start with "state."', async () => {
		document.body.innerHTML = '<input :bind.value.input="username">'
		prototy({
			root: document.body,
			state: { username: 'admin' }
		})
		const lastLogMessage = consoleSpy.mock.lastCall[0]
		expect(lastLogMessage).toContain('[PROTOTY] Invalid bind path "username". Path must start with "state."')
	})
})