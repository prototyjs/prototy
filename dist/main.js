const elements = document.querySelector('.middle')
const content = document.querySelector('.content')

const param = {
	_index: undefined,
	get index() {
		return param._index
	},
	set index(v) {
		param.index !== undefined && elements.children[param.index].classList.remove('active')
		param.index = v
		elements.children[v].classList.add('active')
	},
	headers: []
}

const throttle = (fn, timeout = 150) => {
	let timer = null
	return function perform(...args) {
		if (timer !== null) {
			return
		}
		timer = setTimeout(() => {
			fn.apply(this, args)
			timer = null
		}, timeout)
	}
}

const active = ({ index, href, to }) => {
	param.index = index
	if (href) {
		history.replaceState(null, null, href)
	}
}

const change = () => {
	for (let index = 0; index < param.headers.length; index++) {
		const header = param.headers[index]
		const rect = header.getBoundingClientRect()
		if (rect.top > 0 || rect.bottom > 0) {
			active({ index, href: '#' + header.id, to: false })
			break
		}
	}
}

const navigation = () => {
	const headers = content.querySelectorAll('h1,h2,h3')
	param.headers = headers
	const hash = window.location.hash
	const arr = []
	for (let index = 0;index < headers.length;index++) {
		const href = '#' + headers[index].innerText.replace(' ', '-').toLowerCase()
		const anchor = document.createElement('span')
		anchor.onclick = () => {
			active({ index, href, to: true })
		}
		headers[index].append(anchor)
		if (hash === href) {
			active({ index, href: '', to: true })
		}
		arr.push({
			text: headers[index].textContent,
			tag: headers[index].tagName,
			href
		})
	}
	return arr
}
param.elements = navigation()

param.elements.forEach((el, index) => {
	const nav = document.createElement('a')
	nav.textContent = el.text
	nav.classList.add(el.tag)
	nav.href = el.href
	nav.setAttribute('link', '')
	elements.appendChild(nav)
	if (param.index === index) {
		elements.children[index].classList.add('active')
	}
	nav.onclick = (event) => {
		// if (el.href.startsWith('#')) event.stopPropagation()
		active({ index, href: el.href, to: true })
	}
})

param.handlerScroll = throttle(change, 300)
window.addEventListener('scroll', param.handlerScroll)
history.scrollRestoration = 'manual'