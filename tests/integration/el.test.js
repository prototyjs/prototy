import { describe, it, expect, beforeEach } from 'vitest'
import { Prototy } from '@/prototy.js'

let prototy

describe('Text Directive', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div :el="myElement"></div>'
		prototy = new Prototy({
			root: document.body
		})
	})

	it('should update text after state change', () => {
		expect(document.body.firstElementChild).toBe(prototy.el?.myElement)
	})
})