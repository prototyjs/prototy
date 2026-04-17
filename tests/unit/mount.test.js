import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@/component/mount.js'

describe('mount', () => {
	let element
	let node
	let setup

	beforeEach(() => {
		element = document.createElement('div')
		const template = document.createElement('template')
		template.innerHTML = `
      <div class="component">
        <slot name="header"></slot>
        <slot></slot>
      </div>
    `
		node = template.content.cloneNode(true)
		setup = vi.fn()
	})

	it('should call setup with the provided node', () => {
		mount(element, node, setup)
		expect(setup).toHaveBeenCalledWith(expect.any(DocumentFragment))
	})

	it('should replace named slots with content from element._slots', () => {
		const headerContent = document.createElement('h1')
		element._slots = { header: headerContent }

		mount(element, node, setup)

		expect(element.querySelector('h1')).not.toBeNull()
		expect(element.querySelector('slot[name="header"]')).toBeNull()
	})

	it('should handle default slots', () => {
		const defaultContent = document.createTextNode('Default Content')
		element._slots = { default: defaultContent }

		mount(element, node, setup)

		expect(element.textContent).toContain('Default Content')
	})

	it('should remove empty slots if no content is provided', () => {
		element._slots = {}
		mount(element, node, setup)

		expect(element.querySelectorAll('slot').length).toBe(0)
	})

	it('should replace slot with its own children if no slot content is provided', () => {
		const template = document.createElement('template')
		template.innerHTML = '<slot>Fallback</slot>'
		const fallbackNode = template.content.cloneNode(true)

		element._slots = {}
		mount(element, fallbackNode, setup)

		expect(element.textContent).toBe('Fallback')
	})
})