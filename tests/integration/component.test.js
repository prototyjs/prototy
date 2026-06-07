import { describe, it, expect, beforeEach } from 'vitest'
import { prototy, nextTick } from '@'

describe('Component Directive Complete Suite', () => {
	let root

	beforeEach(() => {
		root = document.createElement('div')
		document.body.appendChild(root)
	})

	describe('Basic Rendering', () => {
		it('should render simple component', async () => {
			root.innerHTML = '<div :component="components.simple"></div>'

			prototy({
				root,
				components: {
					simple: '<div class="simple">Hello World</div>'
				}
			})

			await nextTick()

			const component = root.querySelector('.simple')
			expect(component).not.toBeNull()
			expect(component.textContent).toBe('Hello World')
		})

		it('should render component with template string and state', async () => {
			root.innerHTML = '<div :component="components.greeting"></div>'

			prototy({
				root,
				components: {
					greeting: '<h1 :text="message"></h1>'
				},
				state: { message: 'Welcome!' }
			})

			await nextTick()

			const heading = root.querySelector('h1')
			expect(heading).not.toBeNull()
			expect(heading.textContent).toBe('Welcome!')
		})

		it('should render component with props', async () => {
			root.innerHTML = '<div :component="components.userCard" :props="{ name: userName, age: 25 }"></div>'

			prototy({
				root,
				state: { userName: 'John' },
				components: {
					userCard: '<div><span :text="name"></span>:<span :text="age"></span></div>'
				}
			})

			await nextTick()

			const spans = root.querySelectorAll('span')
			expect(spans[0].textContent).toBe('John')
			expect(spans[1].textContent).toBe('25')
		})

		it('should update component when props change', async () => {
			root.innerHTML = '<div :component="components.display" :props="{ value: counter }"></div>'

			const app = prototy({
				root,
				state: { counter: 0 },
				components: {
					display: '<div :text="value"></div>'
				}
			})

			await nextTick()

			const div = root.querySelector('div')
			expect(div.textContent).toBe('0')

			app.state.counter = 5
			await nextTick()

			expect(div.textContent).toBe('5')
		})
	})

	describe('Conditional Rendering', () => {
		it('should switch components based on state', async () => {
			root.innerHTML = '<div :component="components[currentComponent]"></div>'

			const app = prototy({
				root,
				state: { currentComponent: 'profile' },
				components: {
					profile: '<div class="profile">Profile</div>',
					settings: '<div class="settings">Settings</div>'
				}
			})

			await nextTick()

			expect(root.querySelector('.profile')).not.toBeNull()

			app.state.currentComponent = 'settings'
			await nextTick()

			expect(root.querySelector('.profile')).toBeNull()
			expect(root.querySelector('.settings')).not.toBeNull()
		})

		it('should handle falsy component (no render)', async () => {
			root.innerHTML = '<div :component="show && components.comp"></div>'

			const app = prototy({
				root,
				state: { show: false },
				components: {
					comp: '<div>Content</div>'
				}
			})

			await nextTick()

			const container = root.children[0]
			expect(container.children.length).toBe(0)

			app.state.show = true
			await nextTick()

			expect(root.querySelector('div')).not.toBeNull()
		})
	})

	describe('Nested Components', () => {
		it('should render nested components', async () => {
			root.innerHTML = '<div :component="components.parent"></div>'

			prototy({
				root,
				components: {
					parent: '<div class="parent"><div :component="components.child"></div></div>',
					child: '<div class="child">Child Content</div>'
				}
			})

			await nextTick()

			const parent = root.querySelector('.parent')
			expect(parent).not.toBeNull()

			const child = parent.querySelector('.child')
			expect(child).not.toBeNull()
			expect(child.textContent).toBe('Child Content')
		})

		it('should pass props to nested components', async () => {
			root.innerHTML = '<div :component="components.parent" :props="{ message: msg }"></div>'

			prototy({
				root,
				state: { msg: 'Hello' },
				components: {
					parent: '<div class="parent"><div :component="components.child" :props="{ text: message }"></div></div>',
					child: '<div class="child" :text="text"></div>'
				}
			})

			await nextTick()

			const child = root.querySelector('.child')
			expect(child.textContent).toBe('Hello')
		})

		it('should update nested components when props change', async () => {
			root.innerHTML = '<div :component="components.parent" :props="{ value: counter }"></div>'

			const app = prototy({
				root,
				state: { counter: 1 },
				components: {
					parent: '<div><div :component="components.child" :props="{ num: value }"></div></div>',
					child: '<div :text="num"></div>'
				}
			})

			await nextTick()

			let div = root.querySelector('div div')
			expect(div.textContent).toBe('1')

			app.state.counter = 5
			await nextTick()

			div = root.querySelector('div div')
			expect(div.textContent).toBe('5')
		})
	})

	describe('Cleanup & Resource Management', () => {
		it('should cleanup resources when component is destroyed', async () => {
			document.body.innerHTML = '<div :component="show ? components.first : components.second"></div>'

			const app = prototy({
				root: document.body,
				state: { show: true },
				components: {
					first: '<div el="firstEl">First</div>',
					second: '<div el="secondEl">Second</div>'
				}
			})

			await nextTick()

			expect(app.els.firstEl).toBeDefined()
			expect(app.els.secondEl).toBeUndefined()

			app.state.show = false
			await nextTick()

			expect(app.els.firstEl).toBeUndefined()
			expect(app.els.secondEl).toBeDefined()
		})

		it('should not recreate component when only props change', async () => {
			root.innerHTML = '<div :component="components.counter" :props="{ value: count }"></div>'

			let createCount = 0

			const app = prototy({
				root,
				state: { count: 0 },
				components: {
					counter: {
						template: '<div :text="value"></div>',
						created() {
							createCount++
						}
					}
				}
			})

			await nextTick()

			const initialCreateCount = createCount

			app.state.count = 5
			await nextTick()

			expect(createCount).toBe(initialCreateCount)
		})
	})

	describe('Error Handling & Edge Cases', () => {
		it('should handle undefined component gracefully', async () => {
			root.innerHTML = '<div :component="components.undefined"></div>'

			prototy({
				root,
				components: {}
			})

			await nextTick()

			const div = root.querySelector('div')
			expect(div.innerHTML).toBe('')
		})

		it('should handle component without template', async () => {
			root.innerHTML = '<div :component="components.empty"></div>'

			prototy({
				root,
				components: {
					empty: null
				}
			})

			await nextTick()

			const div = root.querySelector('div')
			expect(div.innerHTML).toBe('')
		})

		it('should reinitialize component when props object changes', async () => {
			root.innerHTML = '<div :component="components.display" :props="props"></div>'

			const app = prototy({
				root,
				state: {
					props: { name: 'Alice', age: 30 }
				},
				components: {
					display: '<div><span :text="name"></span>-<span :text="age"></span></div>'
				}
			})

			await nextTick()

			let spans = root.querySelectorAll('span')
			expect(spans[0].textContent).toBe('Alice')
			expect(spans[1].textContent).toBe('30')

			app.state.props = { name: 'Bob', age: 25 }
			await nextTick()

			spans = root.querySelectorAll('span')
			expect(spans[0].textContent).toBe('Bob')
			expect(spans[1].textContent).toBe('25')
		})
	})
	describe('Auto-registration from template tags', () => {
		it('should register component from template component attribute', async () => {
			root.innerHTML = `
			<template component="button">
				<button>Click</button>
			</template>
			<div :component="components.button"></div>
		`

			const app = prototy({ root })

			await nextTick()

			expect(app.components.button).toBeDefined()
			expect(app.components.button.name).toBe('button')
			expect(app.components.button.template).toBe('<button>Click</button>')
		})

		it('should register multiple components from templates', async () => {
			root.innerHTML = `
			<template component="header">
				<header>Header</header>
			</template>
			<template component="footer">
				<footer>Footer</footer>
			</template>
		`

			const app = prototy({ root })

			await nextTick()

			expect(app.components.header).toBeDefined()
			expect(app.components.footer).toBeDefined()
			expect(app.components.header.template).toBe('<header>Header</header>')
			expect(app.components.footer.template).toBe('<footer>Footer</footer>')
		})

		it('should override manually registered component with template', async () => {
			root.innerHTML = `
			<template component="message">
				<div>From Template</div>
			</template>
		`

			const app = prototy({
				root,
				components: {
					message: '<div>From Manual</div>'
				}
			})

			await nextTick()

			expect(app.components.message.template).toBe('<div>From Template</div>')
		})

		it('should preserve template tags in DOM after registration', async () => {
			root.innerHTML = `
			<template component="test">
				<div>Test</div>
			</template>
		`

			prototy({ root })

			await nextTick()

			const templates = root.querySelectorAll('template')
			expect(templates.length).toBe(1)
			expect(templates[0].getAttribute('component')).toBe('test')
		})
	})
})