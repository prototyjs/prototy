import { describe, it, expect } from 'vitest'
import { prototy, nextTick } from '@'

describe('Attr Directive', () => {

	it('sets attribute when value is string', async () => {
		document.body.innerHTML = '<div :dataTest="state.value"></div>'
		prototy({
			root: document.body,
			state: { value: 'test-value' }
		})
		await nextTick()
		expect(document.body.firstElementChild.getAttribute('dataTest')).toBe('test-value')
	})

	it('removes attribute when value is null', async () => {
		document.body.innerHTML = '<div :dataTest="state.value"></div>'
		prototy({
			root: document.body,
			state: { value: null }
		})
		await nextTick()
		expect(document.body.firstElementChild.hasAttribute('dataTest')).toBe(false)
	})

	it('removes attribute when value is false', async () => {
		document.body.innerHTML = '<div :dataTest="state.value"></div>'
		prototy({
			root: document.body,
			state: { value: false }
		})
		await nextTick()
		expect(document.body.firstElementChild.hasAttribute('dataTest')).toBe(false)
	})

	it('updates attribute when value changes', async () => {
		document.body.innerHTML = '<div :dataTest="state.value"></div>'
		const app = prototy({
			root: document.body,
			state: { value: 'initial' }
		})
		await nextTick()
		expect(document.body.firstElementChild.getAttribute('dataTest')).toBe('initial')

		app.state.value = 'updated'
		await nextTick()
		expect(document.body.firstElementChild.getAttribute('dataTest')).toBe('updated')
	})

	it('removes attribute when value changes to null', async () => {
		document.body.innerHTML = '<div :dataTest="state.value"></div>'
		const app = prototy({
			root: document.body,
			state: { value: 'exists' }
		})
		await nextTick()
		expect(document.body.firstElementChild.getAttribute('dataTest')).toBe('exists')

		app.state.value = null
		await nextTick()
		expect(document.body.firstElementChild.hasAttribute('dataTest')).toBe(false)
	})

	it('adds attribute when value changes from null to string', async () => {
		document.body.innerHTML = '<div :dataTest="state.value"></div>'
		const app = prototy({
			root: document.body,
			state: { value: null }
		})
		await nextTick()
		expect(document.body.firstElementChild.hasAttribute('dataTest')).toBe(false)

		app.state.value = 'new-value'
		await nextTick()
		expect(document.body.firstElementChild.getAttribute('dataTest')).toBe('new-value')
	})
})