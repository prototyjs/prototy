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
})

describe('Bind Directive with Props', () => {
	beforeEach(() => {
		document.body.innerHTML = ''
	})

	it('should bind to props value (readonly)', async () => {
		document.body.innerHTML = `
			<div :component="components.card" :props="{ userName: state.name }"></div>`

		const app = prototy({
			root: document.body,
			state: { name: 'John' },
			components: {
				card: '<input :bind.value.input="userName">'
			}
		})

		await nextTick()

		const input = document.querySelector('input')
		expect(input.value).toBe('John')

		input.value = 'Jane'
		input.dispatchEvent(new Event('input'))
		await nextTick()

		expect(app.state.name).toBe('John')
		expect(input.value).toBe('Jane')
	})

	it('should NOT modify item in each (readonly)', async () => {
		document.body.innerHTML = '<div :each="state.items" :component="components.item"></div>'

		const app = prototy({
			root: document.body,
			state: {
				items: [{ name: 'Alice' }, { name: 'Bob' }]
			},
			components: {
				item: '<div><input :bind.value.input="item.name"></div>'
			}
		})

		await nextTick()

		const inputs = document.querySelectorAll('input')
		expect(inputs[0].value).toBe('Alice')

		inputs[0].value = 'Alice Changed'
		inputs[0].dispatchEvent(new Event('input'))
		await nextTick()

		expect(app.state.items[0].name).toBe('Alice')
	})

	it('should bind to props and update when parent state changes', async () => {
		document.body.innerHTML = '<div :component="components.card" :props="{ value: state.counter }"></div>'

		const app = prototy({
			root: document.body,
			state: { counter: 5 },
			components: {
				card: '<span :text="value"></span><input :bind.value.input="value">'
			}
		})

		await nextTick()

		const input = document.querySelector('input')
		const span = document.querySelector('span')

		expect(input.value).toBe('5')
		expect(span.textContent).toBe('5')

		app.state.counter = 10
		await nextTick()

		expect(input.value).toBe('10')
		expect(span.textContent).toBe('10')
	})
})