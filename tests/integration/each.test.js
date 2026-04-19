import { describe, it, expect } from 'vitest'
import { prototy, nextTick } from '@'

describe('Each Directive', () => {
	it('should correctly handle shift (removing the first element)', async () => {
		const root = document.createElement('div')
		root.innerHTML = '<div id="list" :each="state.arr" :component="components.item"></div>'
		const app = prototy({
			root,
			state: { arr: [{ n: 1 }, { n: 2 }, { n: 3 }] },
			components: { item: '<div :text="item.n"></div>' }
		})

		app.state.arr.shift()
		await nextTick()

		const list = root.querySelector('#list')
		expect(list.children.length).toBe(2)
		expect(list.children[0].textContent).toBe('2')
		expect(list.children[1].textContent).toBe('3')
	})

	it('should correctly work with filter (mass change)', async () => {
		const root = document.createElement('div')
		root.innerHTML = '<div id="list" :each="state.arr" :component="components.item"></div>'
		const app = prototy({
			root,
			state: { arr: [1, 2, 3, 4, 5].map(n => ({ n })) },
			components: { item: '<div :text="item.n"></div>' }
		})

		app.state.arr = app.state.arr.filter(item => item.n % 2 === 0)
		await nextTick()

		const list = root.querySelector('#list')
		expect(list.children.length).toBe(2)
		expect(list.children[0].textContent).toBe('2')
		expect(list.children[1].textContent).toBe('4')
	})

	it('should preserve DOM nodes for unchanged objects (Reconciliation)', async () => {
		const root = document.createElement('div')
		root.innerHTML = '<div id="list" :each="state.arr" :component="components.item"></div>'
		const obj1 = { n: 'stay' }
		const app = prototy({
			root,
			state: { arr: [obj1, { n: 'remove' }] },
			components: { item: '<div :text="item.n"></div>' }
		})

		const list = root.querySelector('#list')
		const firstNodeBefore = list.children[0]

		app.state.arr.push({ n: 'new' })
		app.state.arr.splice(1, 1)
		await nextTick()

		expect(list.children[0]).toBe(firstNodeBefore)
		expect(list.children[0].textContent).toBe('stay')
		expect(list.children.length).toBe(2)
	})

	it('should correctly handle full array replacement with new elements', async () => {
		const root = document.createElement('div')
		root.innerHTML = '<div id="list" :each="state.arr" :component="components.item"></div>'
		const app = prototy({
			root,
			state: { arr: [{ v: 'a' }] },
			components: { item: '<div :text="item.v"></div>' }
		})

		app.state.arr = [{ v: 'x' }, { v: 'y' }]
		await nextTick()

		const list = root.querySelector('#list')
		expect(list.children.length).toBe(2)
		expect(list.children[0].textContent).toBe('x')
		expect(list.children[1].textContent).toBe('y')
	})

	it('should update text when a deep property of an object in the array changes', async () => {
		const root = document.createElement('div')
		root.innerHTML = '<div :each="state.items" :component="components.item"></div>'
		const app = prototy({
			root,
			state: { items: [{ info: { text: 'old' } }] },
			components: { item: '<div class="target" :text="item.info.text"></div>' }
		})

		app.state.items[0].info.text = 'new'
		await nextTick()

		expect(root.querySelector('.target').textContent).toBe('new')
	})

	it('should correctly handle moving and modifying a proxied object', async () => {
		const root = document.createElement('div')
		root.innerHTML = '<div id="list" :each="state.arr" :component="components.item"></div>'
		const app = prototy({
			root,
			state: { arr: [{ name: 'A' }, { name: 'B' }] },
			components: { item: '<div :text="item.name"></div>' }
		})

		const itemA = app.state.arr[0]
		app.state.arr.shift()
		app.state.arr.push(itemA)
		itemA.name = 'A-updated'

		await nextTick()
		const items = root.querySelectorAll('#list > div')
		expect(items[0].textContent).toBe('B')
		expect(items[1].textContent).toBe('A-updated')
	})

	it('should call the reactivity cleanup method when elements are removed (leak protection)', async () => {
		const root = document.createElement('div')
		root.innerHTML = '<div id="list" :each="state.arr" :component="components.item"></div>'
		const app = prototy({
			root,
			state: { arr: [{ id: 1 }, { id: 2 }] },
			components: { item: '<div :text="item.id"></div>' }
		})

		app.state.arr = []
		await nextTick()
		const list = root.querySelector('#list')
		expect(list.children.length).toBe(0)
	})

	it('should correctly transition from an empty state to a populated one', async () => {
		const root = document.createElement('div')
		root.innerHTML = '<div id="list" :each="state.arr" :component="components.item"></div>'
		const app = prototy({
			root,
			state: { arr: [] },
			components: { item: '<div>item</div>' }
		})

		const list = root.querySelector('#list')
		expect(list.children.length).toBe(0)

		app.state.arr.push({ id: 1 })
		await nextTick()

		expect(list.children.length).toBe(1)
	})

	it('should correctly handle nested loops', async () => {
		const root = document.createElement('div')
		root.innerHTML = `<div id="outer" :each="state.groups" :component="components.group"></div>`

		const app = prototy({
			root,
			state: {
				groups: [
					{ name: 'G1', items: [{ v: '1.1' }, { v: '1.2' }] },
					{ name: 'G2', items: [{ v: '2.1' }] }
				]
			},
			components: {
				group: `
          <div class="group">
            <b :text="item.name"></b>
            <div class="inner" :each="item.items" :component="components.cell"></div>
          </div>`,
				cell: '<span :text="item.v"></span>'
			}
		})

		await nextTick()
		const groups = root.querySelectorAll('.group')
		expect(groups.length).toBe(2)
		expect(groups[0].querySelectorAll('span').length).toBe(2)
		expect(groups[1].querySelectorAll('span').length).toBe(1)

		app.state.groups[0].items.push({ v: '1.3' })
		await nextTick()

		expect(groups[0].querySelectorAll('span').length).toBe(3)
	})
	it('should not re-create tags on shift operation', async () => {
		const root = document.createElement('div')
		root.innerHTML = '<div id="list" :each="state.arr" :component="components.item"></div>'

		const app = prototy({
			root,
			state: { arr: [{ id: 1 }, { id: 2 }] },
			components: { item: '<div class="item"></div>' }
		})

		const secondNode = root.querySelectorAll('.item')[1]

		secondNode.__custom_mark = true

		app.state.arr.shift()
		await nextTick()

		const items = root.querySelectorAll('.item')
		expect(items.length).toBe(1)

		expect(items[0].__custom_mark).toBe(true)
		expect(items[0]).toBe(secondNode)
	})
})