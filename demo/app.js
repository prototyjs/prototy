import { prototy } from '@prototy'
import main from './main.html?raw'

const app = prototy({
	root: document.getElementById('root'),
	params: {
		x: 0,
		y: 0
	},
	state: {
		show: false,
		hidden: true,
		test: 'remove',
		value: 2,
		product: {
			price: 10,
			params: {
				count: 1
			}
		},
		arr: [{ color: 'red' }, { color: 'green' }, { color: 'blue' }, { color: 'green' }],
		isActive: false,
		isTest: false,
		dataValue: 'начальное значение',
		customValue: 'новое значение'

	},
	methods: {
		add() {
			this.state.product.params.count++
		},
		query: ({ signal }) => new Promise(res => {
			const t = setTimeout(res, 2000)
			signal?.addEventListener('abort', () => clearTimeout(t), { once: true })
		})
	},
	setters: {
		'arr.1.color'(newValue, oldValue) {
			console.log(newValue, oldValue, this)
			this.state.arr[1].color = 'oooo' // protected
			return newValue
		}
	},
	directives: {
		myHidden: (element, value) => {
			if (typeof value === 'boolean') element.hidden = value
		}
	},
	modifiers: {
		add: (value, postFix) => value + postFix
	},
	components: {
		main,
		color: `<div :text="item.color" class="color"></div>`,
		first: '<h2>first</h2><slot></slot>',
		second: '<h2>second</h2><slot></slot>'
	}
})