import { describe, it, expect, beforeEach } from 'vitest'
import { prototy, nextTick } from '@'

describe('Each Directive Complete Suite', () => {
	let root

	beforeEach(() => {
		root = document.createElement('div')
		document.body.appendChild(root)
	})

	describe('Basic Array Operations', () => {
		it('should render initial array correctly', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			prototy({
				root,
				state: { items: [{ n: 1 }, { n: 2 }, { n: 3 }] },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()
			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(3)
			expect(container.children[0].textContent).toBe('1')
			expect(container.children[2].textContent).toBe('3')
		})

		it('should handle shift (remove first)', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ n: 1 }, { n: 2 }, { n: 3 }] },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()
			app.state.items.shift()
			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(2)
			expect(container.children[0].textContent).toBe('2')
			expect(container.children[1].textContent).toBe('3')
		})

		it('should handle pop (remove last)', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ n: 1 }, { n: 2 }, { n: 3 }] },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()
			app.state.items.pop()
			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(2)
			expect(container.children[0].textContent).toBe('1')
			expect(container.children[1].textContent).toBe('2')
		})

		it('should handle push (add to end)', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ n: 1 }, { n: 2 }] },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()
			app.state.items.push({ n: 3 })
			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(3)
			expect(container.children[2].textContent).toBe('3')
		})

		it('should handle unshift (add to beginning)', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ n: 2 }, { n: 3 }] },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()
			app.state.items.unshift({ n: 1 })
			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(3)
			expect(container.children[0].textContent).toBe('1')
			expect(container.children[1].textContent).toBe('2')
		})

		it('should handle reverse (critical test!)', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ n: 1 }, { n: 2 }, { n: 3 }] },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()
			app.state.items.reverse()
			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(3)
			expect(container.children[0].textContent).toBe('3')
			expect(container.children[1].textContent).toBe('2')
			expect(container.children[2].textContent).toBe('1')
		})

		it('should handle sort', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ n: 3 }, { n: 1 }, { n: 2 }] },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()
			app.state.items.sort((a, b) => a.n - b.n)
			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children[0].textContent).toBe('1')
			expect(container.children[1].textContent).toBe('2')
			expect(container.children[2].textContent).toBe('3')
		})

		it('should handle splice', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }] },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()
			app.state.items.splice(1, 2, { n: 5 }, { n: 6 })
			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(4)
			expect(container.children[0].textContent).toBe('1')
			expect(container.children[1].textContent).toBe('5')
			expect(container.children[2].textContent).toBe('6')
			expect(container.children[3].textContent).toBe('4')
		})
	})

	describe('Index Updates', () => {
		it('should update indices after shift', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] },
				components: {
					item: '<div><span class="idx" :text="index"></span>:<span :text="item.name"></span></div>'
				}
			})

			await nextTick()

			let indices = root.querySelectorAll('.idx')
			expect(indices[0].textContent).toBe('0')
			expect(indices[1].textContent).toBe('1')
			expect(indices[2].textContent).toBe('2')

			app.state.items.shift()
			await nextTick()

			indices = root.querySelectorAll('.idx')
			expect(indices.length).toBe(2)
			expect(indices[0].textContent).toBe('0')
			expect(indices[1].textContent).toBe('1')

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children[0].textContent).toContain('B')
		})

		it('should update indices after reverse', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] },
				components: {
					item: '<div><span class="idx" :text="index"></span>:<span :text="item.name"></span></div>'
				}
			})

			await nextTick()
			app.state.items.reverse()
			await nextTick()

			const indices = root.querySelectorAll('.idx')
			expect(indices[0].textContent).toBe('0')
			expect(indices[1].textContent).toBe('1')
			expect(indices[2].textContent).toBe('2')

			const container = root.querySelector('[id="list"]') || root.children[0]
			const items = container.children
			expect(items[0].textContent).toContain('C')
			expect(items[1].textContent).toContain('B')
			expect(items[2].textContent).toContain('A')
		})
	})

	describe('Nested Each with Props', () => {
		it('should update nested indices when parent reverses', async () => {
			root.innerHTML = `
			<div id="outer" :each="groups" :component="components.group"></div>
		`

			const app = prototy({
				root,
				state: {
					groups: [
						{ name: 'Group A', items: [{ text: 'A1' }, { text: 'A2' }] },
						{ name: 'Group B', items: [{ text: 'B1' }] }
					]
				},
				components: {
					group: `
					<div class="group">
						<div :props="{ gIdx: index }" :component="components.wrapper"></div>
					</div>
				`,
					wrapper: `
					<div class="wrapper">
						<h3 :text="'Group ' + gIdx + ': ' + item.name"></h3>
						<div :each="item.items" :component="components.cell"></div>
					</div>
				`,
					cell: `
					<div class="cell">
						<span :text="index"></span>:
						<span :text="item.text"></span>
						<span :text="' [parent idx: ' + gIdx + ']'"></span>
					</div>
				`
				}
			})

			await nextTick()

			const cleanText = (text) => text.replace(/\s+/g, ' ').trim()

			const checkCell = (cell, expected) => {
				const text = cleanText(cell.textContent)
				expect(text).toBe(expected)
			}

			let cells = root.querySelectorAll('.cell')
			expect(cells.length).toBe(3)

			checkCell(cells[0], '0: A1 [parent idx: 0]')
			checkCell(cells[1], '1: A2 [parent idx: 0]')
			checkCell(cells[2], '0: B1 [parent idx: 1]')

			app.state.groups.reverse()
			await nextTick()

			cells = root.querySelectorAll('.cell')
			expect(cells.length).toBe(3)

			checkCell(cells[0], '0: B1 [parent idx: 0]')
			checkCell(cells[1], '0: A1 [parent idx: 1]')
			checkCell(cells[2], '1: A2 [parent idx: 1]')

			const headers = root.querySelectorAll('h3')
			const cleanHeader = (el) => cleanText(el.textContent)

			expect(cleanHeader(headers[0])).toBe('Group 0: Group B')
			expect(cleanHeader(headers[1])).toBe('Group 1: Group A')
		})
	})

	describe('Performance and State Preservation', () => {
		it('should preserve input state within each items', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'

			const app = prototy({
				root,
				state: { items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] },
				components: {
					item: '<div><input type="text" :value="item.name" /><span :text="item.name"></span></div>'
				}
			})

			await nextTick()

			const firstInput = root.querySelector('input')
			firstInput.value = 'Changed'
			firstInput.dispatchEvent(new Event('input'))
			await nextTick()

			app.state.items.reverse()
			await nextTick()

			const inputs = root.querySelectorAll('input')
			expect(inputs[2].value).toBe('Changed')
		})
	})

	describe('Edge Cases', () => {
		it('should handle empty array', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [] },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()
			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(0)

			app.state.items.push({ n: 1 })
			await nextTick()
			expect(container.children.length).toBe(1)
			expect(container.children[0].textContent).toBe('1')
		})

		it('should handle null/undefined array', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: null },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()
			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(0)

			app.state.items = [{ n: 1 }]
			await nextTick()
			expect(container.children.length).toBe(1)
		})

		it('should handle rapid successive updates', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ n: 1 }] },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()

			app.state.items.push({ n: 2 })
			app.state.items.push({ n: 3 })
			app.state.items.shift()
			app.state.items.reverse()
			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(2)
			expect(container.children[0].textContent).toBe('3')
			expect(container.children[1].textContent).toBe('2')
		})
	})
	describe('Static Lists', () => {
		it('should render simple array as static list', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			prototy({
				root,
				state: { items: ['Apple', 'Banana', 'Cherry'] },
				components: { item: '<div :text="item"></div>' }
			})

			await nextTick()
			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(3)
			expect(container.children[0].textContent).toBe('Apple')
			expect(container.children[2].textContent).toBe('Cherry')
		})

		it('should NOT update static list when data changes', async () => {
			root.innerHTML = '<div id="list" :each.once="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: ['Apple', 'Banana', 'Cherry'] },
				components: { item: '<div :text="item"></div>' }
			})

			await nextTick()

			app.state.items = ['New1', 'New2']
			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(3)
			expect(container.children[0].textContent).toBe('Apple')
			expect(container.children[1].textContent).toBe('Banana')
		})

		it('should render array of objects as static with once modifier', async () => {
			root.innerHTML = '<div id="list" :each.once="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ n: 1 }, { n: 2 }, { n: 3 }] },
				components: { item: '<div :text="item.n"></div>' }
			})

			await nextTick()
			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(3)
			expect(container.children[0].textContent).toBe('1')
			expect(container.children[2].textContent).toBe('3')

			app.state.items.push({ n: 4 })
			await nextTick()

			expect(container.children.length).toBe(3)
		})

		it('should handle index in static list', async () => {
			root.innerHTML = '<div id="list" :each.once="items" :component="components.item"></div>'
			prototy({
				root,
				state: { items: ['A', 'B', 'C'] },
				components: {
					item: '<div><span class="idx" :text="index"></span>:<span :text="item"></span></div>'
				}
			})

			await nextTick()

			const indices = root.querySelectorAll('.idx')
			expect(indices[0].textContent).toBe('0')
			expect(indices[1].textContent).toBe('1')
			expect(indices[2].textContent).toBe('2')

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children[0].textContent).toContain('A')
			expect(container.children[1].textContent).toContain('B')
			expect(container.children[2].textContent).toContain('C')
		})

		it('should handle empty array with once modifier', async () => {
			root.innerHTML = '<div id="list" :each.once="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [] },
				components: { item: '<div :text="item"></div>' }
			})

			await nextTick()
			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(0)

			app.state.items = ['New']
			await nextTick()

			expect(container.children.length).toBe(0)
		})

		it('should render nested static lists', async () => {
			root.innerHTML = `
			<div id="outer" :each.once="groups" :component="components.group"></div>
		`

			prototy({
				root,
				state: {
					groups: [
						{ name: 'Group A', items: ['A1', 'A2'] },
						{ name: 'Group B', items: ['B1'] }
					]
				},
				components: {
					group: `
					<div class="group">
						<h3 :text="item.name"></h3>
						<div :each="item.items" :component="components.cell"></div>
					</div>
				`,
					cell: '<div class="cell"><span :text="item"></span></div>'
				}
			})

			await nextTick()

			const cells = root.querySelectorAll('.cell')
			expect(cells.length).toBe(3)
			expect(cells[0].textContent).toBe('A1')
			expect(cells[1].textContent).toBe('A2')
			expect(cells[2].textContent).toBe('B1')
		})

		it('should NOT react to changes in nested static lists', async () => {
			root.innerHTML = `
			<div id="outer" :each.once="groups" :component="components.group"></div>
		`

			const app = prototy({
				root,
				state: {
					groups: [
						{ name: 'Group A', items: ['A1', 'A2'] }
					]
				},
				components: {
					group: `
					<div class="group">
						<h3 :text="item.name"></h3>
						<div :each="item.items" :component="components.cell"></div>
					</div>
				`,
					cell: '<div class="cell"><span :text="item"></span></div>'
				}
			})

			await nextTick()

			let cells = root.querySelectorAll('.cell')
			expect(cells.length).toBe(2)

			app.state.groups[0].items.push('A3')
			await nextTick()

			cells = root.querySelectorAll('.cell')
			expect(cells.length).toBe(2)
			expect(cells[0].textContent).toBe('A1')
		})
		it('should render array without component', async () => {
			root.innerHTML = '<div id="list" :each="items"><div :text="item"></div></div>'
			prototy({
				root,
				state: { items: ['Apple', 'Banana', 'Cherry'] }
			})

			await nextTick()
			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(3)
			expect(container.children[0].textContent).toBe('Apple')
			expect(container.children[2].textContent).toBe('Cherry')
		})
	})
})