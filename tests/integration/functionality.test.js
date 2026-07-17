import { describe, it, expect, beforeEach } from 'vitest'
import { prototy, nextTick } from '@'

describe('Props with Functional Directives', () => {
	let root

	beforeEach(() => {
		root = document.createElement('div')
		document.body.appendChild(root)
	})

	it('should pass props to component and render with functional directives', async () => {
		root.innerHTML = `
			<div :component="components.userCard" :props="{ name: userName, age: 25 }" el="card"></div>
		`

		const app = prototy({
			root,
			state: { userName: 'John' },
			components: {
				userCard: {
					template: `
						<div el="cardContainer">
							<span el="nameSpan"></span>
							<span el="ageSpan"></span>
						</div>
					`,
					elements: {
						nameSpan: {
							text({ props }) {
								return props.name
							}
						},
						ageSpan: {
							text({ props }) {
								return String(props.age)
							}
						}
					}
				}
			}
		})

		await nextTick()

		const card = app.els.card
		expect(card.els.nameSpan.textContent).toBe('John')
		expect(card.els.ageSpan.textContent).toBe('25')
	})

	it('should update props reactively', async () => {
		root.innerHTML = `
			<div :component="components.userCard" :props="{ name: userName, age: 25 }" el="card"></div>
		`

		const app = prototy({
			root,
			state: { userName: 'John' },
			components: {
				userCard: {
					template: `
						<div el="cardContainer">
							<span el="nameSpan"></span>
						</div>
					`,
					elements: {
						nameSpan: {
							text({ props }) {
								return props.name
							}
						}
					}
				}
			}
		})

		await nextTick()

		const card = app.els.card
		expect(card.els.nameSpan.textContent).toBe('John')

		app.state.userName = 'Jane'
		await nextTick()

		expect(card.els.nameSpan.textContent).toBe('Jane')
	})

	it('should pass props from functional directive', async () => {
		root.innerHTML = `
			<div el="cardPlaceholder"></div>
		`

		const app = prototy({
			root,
			state: { title: 'Hello', count: 5 },
			components: {
				card: {
					template: `
						<div el="cardContainer">
							<h3 el="titleSpan"></h3>
							<span el="countSpan"></span>
						</div>
					`,
					elements: {
						titleSpan: {
							text({ props }) {
								return props.title
							}
						},
						countSpan: {
							text({ props }) {
								return String(props.count)
							}
						}
					}
				}
			},
			elements: {
				cardPlaceholder: {
					component() {
						return this.components.card
					},
					props() {
						return {
							title: this.state.title,
							count: this.state.count
						}
					}
				}
			}
		})

		await nextTick()

		const card = app.els.cardPlaceholder
		expect(card.els.titleSpan.textContent).toBe('Hello')
		expect(card.els.countSpan.textContent).toBe('5')

		app.state.title = 'World'
		app.state.count = 10
		await nextTick()

		expect(card.els.titleSpan.textContent).toBe('World')
		expect(card.els.countSpan.textContent).toBe('10')
	})

	it('should pass props with functional directives in each', async () => {
		root.innerHTML = `
			<div :each="items" :component="components.item" el="list"></div>
		`

		const app = prototy({
			root,
			state: {
				items: [
					{ id: 1, name: 'Apple' },
					{ id: 2, name: 'Banana' },
					{ id: 3, name: 'Cherry' }
				]
			},
			components: {
				item: {
					template: `
						<div el="itemContainer">
							<span el="indexSpan"></span>
							<span el="nameSpan"></span>
							<span el="idSpan"></span>
						</div>
					`,
					elements: {
						indexSpan: {
							text({ props }) {
								return String(props.index + 1)
							}
						},
						nameSpan: {
							text({ props }) {
								return props.item.name
							}
						},
						idSpan: {
							text({ props }) {
								return String(props.item.id)
							}
						}
					}
				}
			}
		})

		await nextTick()

		const list = app.els.list

		expect(list.children[0].els.indexSpan.textContent).toBe('1')
		expect(list.children[0].els.nameSpan.textContent).toBe('Apple')
		expect(list.children[0].els.idSpan.textContent).toBe('1')

		expect(list.children[1].els.indexSpan.textContent).toBe('2')
		expect(list.children[1].els.nameSpan.textContent).toBe('Banana')
		expect(list.children[1].els.idSpan.textContent).toBe('2')

		expect(list.children[2].els.indexSpan.textContent).toBe('3')
		expect(list.children[2].els.nameSpan.textContent).toBe('Cherry')
		expect(list.children[2].els.idSpan.textContent).toBe('3')

		app.state.items.push({ id: 4, name: 'Date' })
		await nextTick()

		expect(list.children.length).toBe(4)
		expect(list.children[3].els.indexSpan.textContent).toBe('4')
		expect(list.children[3].els.nameSpan.textContent).toBe('Date')
		expect(list.children[3].els.idSpan.textContent).toBe('4')
	})

	it('should handle nested components with props', async () => {
		root.innerHTML = `
			<div :component="components.parent" :props="{ message: greeting }" el="parent"></div>
		`

		const app = prototy({
			root,
			state: { greeting: 'Hello from parent' },
			components: {
				parent: {
					template: `
						<div el="parentContainer">
							<div :component="components.child" :props="{ text: message }" el="childPlaceholder"></div>
						</div>
					`
				},
				child: {
					template: `
						<div el="childContainer">
							<span el="textSpan"></span>
						</div>
					`,
					elements: {
						textSpan: {
							text({ props }) {
								return props.text
							}
						}
					}
				}
			}
		})

		await nextTick()

		const parent = app.els.parent
		const child = parent.els.childPlaceholder

		expect(child.els.textSpan.textContent).toBe('Hello from parent')

		app.state.greeting = 'Updated message'
		await nextTick()

		expect(child.els.textSpan.textContent).toBe('Updated message')
	})
	it('should bind with trim modifier', async () => {
		root.innerHTML = '<input el="myInput" />'

		const app = prototy({
			root,
			state: { product: { desc: '  hello  ' } },
			elements: {
				myInput: {
					'bind.value.input.trim'() {
						return {
							get: () => this.state.product.desc,
							set: (val) => this.state.product.desc = val
						}
					}
				}
			}
		})

		await nextTick()

		const input = app.els.myInput

		expect(input.value).toBe('hello')

		input.value = '  world  '
		input.dispatchEvent(new Event('input'))
		await nextTick()
		expect(app.state.product.desc).toBe('world')
	})
})
describe('Component with Local Methods and Params', () => {
	let root

	beforeEach(() => {
		root = document.createElement('div')
		document.body.appendChild(root)
	})

	it('should use local methods and params in component', async () => {
		root.innerHTML = `
			<div :component="components.counter" el="cmp"></div>
		`

		const app = prototy({
			root,
			state: { localCount: 0 },
			components: {
				counter: {
					template: `
						<div el="counter">
							<span el="display" :text="localCount"></span>
							<button el="resetBtn">Reset</button>
							<button el="incrementBtn">+2</button>
						</div>
					`,
					params: {
						step: 2
					},
					methods: {
						reset() {
							this.state.localCount = this.params.step
						},
						increment() {
							this.state.localCount += this.params.step
						}
					},
					elements: {
						resetBtn: {
							onclick() {
								this.methods.reset()
							}
						},
						incrementBtn: {
							onclick() {
								this.methods.increment()
							}
						}
					}
				}
			}
		})

		await nextTick()

		const cmp = app.els.cmp

		expect(cmp.els.display.textContent).toBe('0')

		cmp.els.incrementBtn.click()
		await nextTick()
		expect(cmp.els.display.textContent).toBe('2')

		cmp.els.incrementBtn.click()
		await nextTick()
		expect(cmp.els.display.textContent).toBe('4')

		cmp.els.resetBtn.click()
		await nextTick()
		expect(cmp.els.display.textContent).toBe('2')

		app.state.localCount = 10
		await nextTick()
		expect(cmp.els.display.textContent).toBe('10')
	})

	it('should merge global and local methods', async () => {
		root.innerHTML = `
			<div :component="components.counter" el="cmp"></div>
		`

		const app = prototy({
			root,
			state: { count: 0 },
			methods: {
				globalReset() {
					this.state.count = 0
				}
			},
			components: {
				counter: {
					template: `
						<div el="counter">
							<span el="display" :text="count"></span>
							<button el="globalResetBtn">Global Reset</button>
							<button el="localResetBtn">Local Reset</button>
						</div>
					`,
					params: {
						defaultValue: 5
					},
					methods: {
						localReset() {
							this.state.count = this.params.defaultValue
						}
					},
					elements: {
						globalResetBtn: {
							onclick() {
								this.methods.globalReset()
							}
						},
						localResetBtn: {
							onclick() {
								this.methods.localReset()
							}
						}
					}
				}
			}
		})

		await nextTick()

		const cmp = app.els.cmp

		expect(cmp.els.display.textContent).toBe('0')

		cmp.els.localResetBtn.click()
		await nextTick()
		expect(cmp.els.display.textContent).toBe('5')

		app.state.count = 10
		await nextTick()
		expect(cmp.els.display.textContent).toBe('10')

		cmp.els.globalResetBtn.click()
		await nextTick()
		expect(cmp.els.display.textContent).toBe('0')
	})

	it('should access local params in expressions', async () => {
		root.innerHTML = `
			<div :component="components.counter" el="cmp"></div>
		`

		const app = prototy({
			root,
			components: {
				counter: {
					template: `
						<div el="counter">
							<span el="stepDisplay" :text="'Step: ' + step"></span>
							<span el="maxDisplay" :text="'Max: ' + maxValue"></span>
						</div>
					`,
					params: {
						step: 3,
						maxValue: 100
					}
				}
			}
		})

		await nextTick()

		const cmp = app.els.cmp

		expect(cmp.els.stepDisplay.textContent).toBe('Step: 3')
		expect(cmp.els.maxDisplay.textContent).toBe('Max: 100')
	})
})