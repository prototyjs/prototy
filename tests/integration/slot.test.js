import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prototy, nextTick } from '@'

describe('Component Slots', () => {

	const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

	beforeEach(() => {
		consoleSpy.mockClear()
		document.body.innerHTML = ''
	})

	it('should correctly update text in a slot when state changes', async () => {
		document.body.innerHTML = `
      <div id="app">
        <div :component="components.card">
          <h1 slot="header" :text="state.title"></h1>
        </div>
      </div>
    `
		const app = prototy({
			root: document.getElementById('app'),
			state: { title: 'Hello' },
			components: {
				card: `<div class="card"><slot name="header"></slot></div>`
			}
		})

		expect(document.querySelector('h1').textContent).toBe('Hello')
		app.state.title = 'Updated'
		await nextTick()

		const headerAfterUpdate = document.querySelector('h1')
		expect(headerAfterUpdate.textContent).toBe('Updated')
	})

	it('should maintain slot reactivity when the parent template changes', async () => {
		document.body.innerHTML = `
      <div id="app">
        <div :component="state.showFirst ? components.first : components.second">
          <span slot="content" :text="state.count"></span>
        </div>
      </div>
    `
		const app = prototy({
			root: document.getElementById('app'),
			state: { showFirst: true, count: 1 },
			components: {
				first: '<div class="one"><slot name="content"></slot></div>',
				second: '<section class="two"><slot name="content"></slot></section>'
			}
		})

		expect(document.querySelector('.one span').textContent).toBe('1')
		app.state.showFirst = false
		await nextTick()

		const span = document.querySelector('.two span')
		expect(span).not.toBeNull()

		app.state.count = 42
		await nextTick()
		expect(span.textContent).toBe('42')
	})

	it('should work correctly with nested slots (slot within a slot)', async () => {
		document.body.innerHTML = `
      <div id="app">
        <div :component="components.outer">
          <div slot="outer-slot">
            <div :component="components.inner">
              <b slot="inner-slot" :text="state.val"></b>
            </div>
          </div>
        </div>
      </div>
    `
		const app = prototy({
			root: document.getElementById('app'),
			state: { val: 'nested' },
			components: {
				outer: '<div class="outer"><slot name="outer-slot"></slot></div>',
				inner: '<div class="inner"><slot name="inner-slot"></slot></div>'
			}
		})

		const bold = document.querySelector('.inner b')
		expect(bold.textContent).toBe('nested')

		app.state.val = 'updated-nested'
		await nextTick()
		expect(bold.textContent).toBe('updated-nested')
	})

	it('should render fallback content if no slot is provided', async () => {
		document.body.innerHTML = `
      <div id="app">
        <div :component="components.card"></div>
      </div>
    `
		prototy({
			root: document.getElementById('app'),
			components: {
				card: `<div><slot name="header">Default Header</slot></div>`
			}
		})

		expect(document.body.textContent).toContain('Default Header')
	})
	it('should log an error if the same slot is occupied more than once', async () => {
		document.body.innerHTML = `
    <div id="app">
      <div :component="components.card">
        <div slot="header">First Content</div>
        <div slot="header">Second Content</div>
      </div>
    </div>
  `
		prototy({
			root: document.getElementById('app'),
			components: {
				card: `<div><slot name="header"></slot></div>`
			}
		})

		const lastLogMessage = consoleSpy.mock.lastCall[0]
		expect(lastLogMessage).toContain('[PROTOTY] Slot "header" is already occupied in component')
	})
})