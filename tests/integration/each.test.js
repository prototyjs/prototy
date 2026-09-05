import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prototy, nextTick } from '@'

describe('Each Directive Complete Suite', () => {
	let root
	const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

	beforeEach(() => {
		consoleSpy.mockClear()
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

	describe('Index Updates with Default Scope', () => {
		it('should use default itemIndex when no scope', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] },
				components: {
					item: '<div><span class="idx" :text="itemIndex"></span>:<span :text="item.name"></span></div>'
				}
			})

			await nextTick()

			const indices = root.querySelectorAll('.idx')
			expect(indices[0].textContent).toBe('0')
			expect(indices[1].textContent).toBe('1')
			expect(indices[2].textContent).toBe('2')

			app.state.items.shift()
			await nextTick()

			const updatedIndices = root.querySelectorAll('.idx')
			expect(updatedIndices.length).toBe(2)
			expect(updatedIndices[0].textContent).toBe('0')
			expect(updatedIndices[1].textContent).toBe('1')
		})

		it('should use custom scope names', async () => {
			root.innerHTML = '<div id="list" :each="items" scope="user" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ name: 'A' }, { name: 'B' }] },
				components: {
					item: '<div><span class="idx" :text="userIndex"></span>:<span :text="user.name"></span></div>'
				}
			})

			await nextTick()

			const indices = root.querySelectorAll('.idx')
			expect(indices[0].textContent).toBe('0')
			expect(indices[1].textContent).toBe('1')

			app.state.items.reverse()
			await nextTick()

			const updatedIndices = root.querySelectorAll('.idx')
			expect(updatedIndices[0].textContent).toBe('0')
			expect(updatedIndices[1].textContent).toBe('1')

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children[0].textContent).toContain('B')
			expect(container.children[1].textContent).toContain('A')
		})

		it('should update indices after reverse with default scope', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] },
				components: {
					item: '<div><span class="idx" :text="itemIndex"></span>:<span :text="item.name"></span></div>'
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

		it('should NOT allow writing to index (read-only)', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			prototy({
				root,
				state: { items: [{ name: 'A', index: 0 }] },
				components: {
					item: '<div :onclick="itemIndex = 5" :text="item.name + \'-\' + itemIndex"></div>'
				}
			})

			await nextTick()

			const div = root.querySelector('div')
			expect(div.textContent).toBe('A-0')

			div.click()
			await nextTick()

			expect(div.textContent).toBe('A-0')
		})

		it('should NOT allow writing to custom index (read-only)', async () => {
			root.innerHTML = '<div id="list" :each="items" scope="user" :component="components.item"></div>'
			prototy({
				root,
				state: { items: [{ name: 'A' }] },
				components: {
					item: '<div :onclick="userIndex = 5" :text="user.name + \'-\' + userIndex"></div>'
				}
			})

			await nextTick()

			const div = root.querySelector('div')
			expect(div.textContent).toBe('A-0')

			div.click()
			await nextTick()
			expect(div.textContent).toBe('A-0')
		})
	})

	describe('Nested Each with Props', () => {
		it('should update nested indices when parent reverses', async () => {
			root.innerHTML = `
			<div id="outer" :each="groups" scope="group" :component="components.group"></div>
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
						<div :props="{ gIdx: groupIndex }" :component="components.wrapper"></div>
					</div>
				`,
					wrapper: `
					<div class="wrapper">
						<h3 :text="'Group ' + gIdx + ': ' + group.name"></h3>
						<div :each="group.items" scope="item" :component="components.cell"></div>
					</div>
				`,
					cell: `
					<div class="cell">
						<span :text="itemIndex"></span>:
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

		it('should handle nested each without scope (uses default)', async () => {
			root.innerHTML = `
	<div id="outer" :each="groups" scope="group" :component="components.group"></div>
`
			prototy({
				root,
				state: {
					groups: [
						{ name: 'Group A', items: [{ text: 'A1' }, { text: 'A2' }] }
					]
				},
				components: {
					group: `
			<div class="group">
				<div :props="{ gIdx: groupIndex }" :component="components.wrapper"></div>
			</div>
		`,
					wrapper: `
			<div class="wrapper">
				<h3 :text="'Group ' + gIdx + ': ' + group.name"></h3>
				<div :each="group.items" :component="components.cell"></div>
			</div>
		`,
					cell: `
			<div class="cell">
				<span :text="itemIndex"></span>:
				<span :text="item.text"></span>
				<span :text="' [parent idx: ' + gIdx + ']'"></span>
			</div>
		`
				}
			})

			await nextTick()

			const cleanText = (text) => text.replace(/\s+/g, ' ').trim()
			const cells = root.querySelectorAll('.cell')
			expect(cells.length).toBe(2)
			expect(cleanText(cells[0].textContent)).toBe('0: A1 [parent idx: 0]')
			expect(cleanText(cells[1].textContent)).toBe('1: A2 [parent idx: 0]')
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

		it('should reuse DOM nodes when array items are reordered', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'

			const items = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }]
			const app = prototy({
				root,
				state: { items },
				components: {
					item: '<div :text="item.name" data-id="item.id"></div>'
				}
			})

			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			const firstNode = container.children[0]
			const secondNode = container.children[1]

			app.state.items.reverse()
			await nextTick()

			expect(container.children[2]).toBe(firstNode)
			expect(container.children[1]).toBe(secondNode)
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

		it('should handle array of primitives with default scope', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: ['A', 'B', 'C'] },
				components: {
					item: '<div><span :text="itemIndex"></span>:<span :text="item"></span></div>'
				}
			})

			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(3)
			expect(container.children[0].textContent).toBe('0:A')
			expect(container.children[1].textContent).toBe('1:B')
			expect(container.children[2].textContent).toBe('2:C')
		})
	})

	describe('Static Lists with Scope', () => {
		it('should render simple array as static list with default scope', async () => {
			root.innerHTML = '<div id="list" :each.once="items" :component="components.item"></div>'
			prototy({
				root,
				state: { items: ['Apple', 'Banana', 'Cherry'] },
				components: {
					item: '<div><span :text="itemIndex"></span>:<span :text="item"></span></div>'
				}
			})

			await nextTick()
			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(3)
			expect(container.children[0].textContent).toBe('0:Apple')
			expect(container.children[1].textContent).toBe('1:Banana')
			expect(container.children[2].textContent).toBe('2:Cherry')
		})

		it('should render static list with custom scope', async () => {
			root.innerHTML = '<div id="list" :each.once="items" scope="fruit" :component="components.item"></div>'
			prototy({
				root,
				state: { items: ['Apple', 'Banana', 'Cherry'] },
				components: {
					item: '<div><span :text="fruitIndex"></span>:<span :text="fruit"></span></div>'
				}
			})

			await nextTick()
			const container = root.querySelector('[id="list"]') || root.children[0]
			expect(container.children.length).toBe(3)
			expect(container.children[0].textContent).toBe('0:Apple')
			expect(container.children[1].textContent).toBe('1:Banana')
			expect(container.children[2].textContent).toBe('2:Cherry')
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

		it('should handle nested static lists with scope', async () => {
			root.innerHTML = `
			<div id="outer" :each.once="groups" scope="group" :component="components.group"></div>
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
						<h3 :text="'Group ' + groupIndex + ': ' + group.name"></h3>
						<div :each.once="group.items" scope="item" :component="components.cell"></div>
					</div>
				`,
					cell: '<div class="cell"><span :text="itemIndex"></span>:<span :text="item"></span></div>'
				}
			})

			await nextTick()

			const cells = root.querySelectorAll('.cell')
			expect(cells.length).toBe(3)
			expect(cells[0].textContent).toBe('0:A1')
			expect(cells[1].textContent).toBe('1:A2')
			expect(cells[2].textContent).toBe('0:B1')

			const headers = root.querySelectorAll('h3')
			expect(headers[0].textContent).toBe('Group 0: Group A')
			expect(headers[1].textContent).toBe('Group 1: Group B')
		})

		it('should NOT react to changes in nested static lists', async () => {
			root.innerHTML = `
			<div id="outer" :each.once="groups" scope="group" :component="components.group"></div>
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
						<h3 :text="'Group ' + groupIndex + ': ' + group.name"></h3>
						<div :each.once="group.items" scope="item" :component="components.cell"></div>
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
			root.innerHTML = '<div id="list" :each.once="items"><div :text="item"></div></div>'
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

	describe('Cleanup', () => {
		it('should cleanup component els when items are removed', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item" el="listEl"></div>'
			const app = prototy({
				root,
				state: {
					items: [
						{ id: 1, name: 'First' },
						{ id: 2, name: 'Second' },
						{ id: 3, name: 'Third' }
					]
				},
				components: {
					item: {
						template: `
						<div el="itemEl">
							<span el="nameSpan" :text="item.name"></span>
							<span el="indexSpan" :text="itemIndex"></span>
						</div>
					`
					}
				}
			})

			await nextTick()
			const listEl = app.els.listEl

			expect(listEl.children[0].els.nameSpan.textContent).toBe('First')
			expect(listEl.children[1].els.nameSpan.textContent).toBe('Second')
			expect(listEl.children[2].els.nameSpan.textContent).toBe('Third')

			app.state.items.splice(1, 1)
			await nextTick()

			expect(listEl.children.length).toBe(2)
			expect(listEl.children[0].els.nameSpan.textContent).toBe('First')
			expect(listEl.children[1].els.nameSpan.textContent).toBe('Third')
			expect(listEl.children[1].els.nameSpan.textContent).not.toBe('Second')
		})

		it('should cleanup events when items are removed', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'
			const app = prototy({
				root,
				state: { items: [{ id: 1 }, { id: 2 }], clickCount: 0 },
				components: {
					item: '<div :onclick="clickCount++" :text="item.id" class="item"></div>'
				}
			})
			await nextTick()
			root.querySelector('.item').click()
			await nextTick()
			expect(app.state.clickCount).toBe(1)

			app.state.items.shift()
			await nextTick()

			root.querySelector('.item').click()
			await nextTick()
			expect(app.state.clickCount).toBe(2)
		})
	})

	describe('Optimization Tests', () => {
		it('should reuse nodes when array is reversed (optimization)', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'

			const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
			const app = prototy({
				root,
				state: { items },
				components: {
					item: '<div :text="item.id" data-id="item.id"></div>'
				}
			})

			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]
			const firstNode = container.children[0]
			const secondNode = container.children[1]
			const thirdNode = container.children[2]

			app.state.items.reverse()
			await nextTick()

			expect(container.children[0]).toBe(thirdNode)
			expect(container.children[1]).toBe(secondNode)
			expect(container.children[2]).toBe(firstNode)
		})

		it('should not call setup twice for same node', async () => {
			root.innerHTML = '<div id="list" :each="items" :component="components.item"></div>'

			const app = prototy({
				root,
				state: { items: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }] },
				components: {
					item: {
						template: `
					<div el="itemEl">
						<span el="nameSpan" :text="item.name"></span>
						<span el="indexSpan" :text="itemIndex"></span>
					</div>
				`
					}
				}
			})

			await nextTick()

			const container = root.querySelector('[id="list"]') || root.children[0]

			const firstNode = container.children[0]
			const secondNode = container.children[1]
			const firstEls = firstNode.els
			const secondEls = secondNode.els

			expect(firstEls).toBeDefined()
			expect(secondEls).toBeDefined()
			expect(firstEls.nameSpan.textContent).toBe('A')
			expect(secondEls.nameSpan.textContent).toBe('B')

			app.state.items.reverse()
			await nextTick()

			expect(container.children[0]).toBe(secondNode)
			expect(container.children[1]).toBe(firstNode)

			expect(container.children[0].els).toBe(secondEls)
			expect(container.children[1].els).toBe(firstEls)

			expect(container.children[0].els.nameSpan.textContent).toBe('B')
			expect(container.children[1].els.nameSpan.textContent).toBe('A')
		})
	})

	describe('Nested Scope with Static Lists', () => {
		it('should access parent scope variables in nested static loop', async () => {
			root.innerHTML = `
			<div id="app">
				<div :each.once="monthsData" scope="month" el="outer">
					<div class="calendar-month">
						<h3 :text="month.title"></h3>
						<div :each.once="month.cells" scope="day" class="calendar-grid" el="inner">
							<span
								:text="day.value"
								:class="{
									'is-today': isToday(month.year, month.monthIndex, day.value),
									'is-weekend': isWeekend(day.value)
								}"
							></span>
						</div>
					</div>
				</div>
			</div>
		`

			const app = prototy({
				root,
				state: {
					monthsData: [
						{
							year: 2025,
							monthIndex: 0,
							title: 'January 2025',
							cells: [
								{ value: 1 },
								{ value: 2 },
								{ value: 3 }
							]
						}
					]
				},
				methods: {
					isToday(year, monthIndex, day) {
						return year === 2025 && monthIndex === 0 && day === 1
					},
					isWeekend(day) {
						return day === 6 || day === 7
					}
				}
			})

			await nextTick()

			const outer = app.els.outer
			const inner = outer.querySelector('.calendar-grid')

			const h3 = outer.querySelector('h3')
			expect(h3.textContent).toBe('January 2025')

			const spans = inner.querySelectorAll('span')
			expect(spans.length).toBe(3)
			expect(spans[0].textContent).toBe('1')
			expect(spans[1].textContent).toBe('2')
			expect(spans[2].textContent).toBe('3')

			expect(spans[0].className).toContain('is-today')
			expect(spans[1].className).not.toContain('is-today')
			expect(spans[2].className).not.toContain('is-today')
		})

		it('should update nested static when parent data changes', async () => {
			root.innerHTML = `
			<div id="app">
				<div :each="monthsData" scope="month" el="outer">
					<div class="calendar-month">
						<h3 :text="month.title"></h3>
						<div :each.once="month.cells" scope="day" class="calendar-grid">
							<span :text="day.value"></span>
						</div>
					</div>
				</div>
			</div>
		`

			const app = prototy({
				root,
				state: {
					monthsData: [
						{
							title: 'January 2025',
							cells: [{ value: 1 }, { value: 2 }, { value: 3 }]
						}
					]
				}
			})

			await nextTick()

			const outer = app.els.outer
			const h3 = outer.querySelector('h3')
			expect(h3.textContent).toBe('January 2025')

			const spans = outer.querySelectorAll('span')
			expect(spans.length).toBe(3)
			expect(spans[0].textContent).toBe('1')
			expect(spans[1].textContent).toBe('2')
			expect(spans[2].textContent).toBe('3')

			app.state.monthsData[0].title = 'February 2025'
			app.state.monthsData[0].cells = [{ value: 4 }, { value: 5 }]
			await nextTick()

			expect(h3.textContent).toBe('February 2025')

			const updatedSpans = outer.querySelectorAll('span')
			expect(updatedSpans.length).toBe(3)
			expect(updatedSpans[0].textContent).toBe('1')
		})

		it('should handle nested static with custom scopes and methods', async () => {
			root.innerHTML = `
			<div id="app">
				<div :each.once="users" scope="user" el="outer">
					<div class="user-card">
						<h3 :text="'User: ' + user.name"></h3>
						<div :each.once="user.tags" scope="tag" class="tags">
							<span
								:class="{
									'active': isActive(user.id, tag)
								}"
								:text="tag"
							></span>
						</div>
					</div>
				</div>
			</div>
		`

			const app = prototy({
				root,
				state: {
					users: [
						{
							id: 1,
							name: 'John',
							tags: ['developer', 'designer']
						},
						{
							id: 2,
							name: 'Jane',
							tags: ['manager', 'designer']
						}
					]
				},
				methods: {
					isActive(userId, tag) {
						return userId === 1 && tag === 'developer'
					}
				}
			})

			await nextTick()

			const outer = app.els.outer

			const userCards = outer.querySelectorAll('.user-card')
			expect(userCards.length).toBe(2)
			expect(userCards[0].querySelector('h3').textContent).toBe('User: John')
			expect(userCards[1].querySelector('h3').textContent).toBe('User: Jane')

			const firstTags = userCards[0].querySelectorAll('.tags span')
			expect(firstTags.length).toBe(2)
			expect(firstTags[0].textContent).toBe('developer')
			expect(firstTags[0].className).toContain('active')
			expect(firstTags[1].textContent).toBe('designer')
			expect(firstTags[1].className).not.toContain('active')

			const secondTags = userCards[1].querySelectorAll('.tags span')
			expect(secondTags.length).toBe(2)
			expect(secondTags[0].textContent).toBe('manager')
			expect(secondTags[0].className).not.toContain('active')
			expect(secondTags[1].textContent).toBe('designer')
			expect(secondTags[1].className).not.toContain('active')
		})
	})
})