import { describe, it, expect, vi } from 'vitest'
import { nextTick } from '@/utils/nextTick.js'

describe('nextTick', () => {
	it('should execute the callback after microtask and animation frame', async () => {
		let value = 'original'

		nextTick(() => {
			value = 'changed'
		})
		expect(value).toBe('original')

		await nextTick()
		expect(value).toBe('changed')
	})

	it('should return a Promise that resolves when the callback is done', async () => {
		const callback = vi.fn(() => 'result')
		const promise = nextTick(callback)

		expect(promise).toBeInstanceOf(Promise)

		const result = await promise
		expect(callback).toHaveBeenCalled()
		expect(result).toBe('result')
	})

	it('should return a resolved Promise if no callback is provided', async () => {
		const promise = nextTick()

		expect(promise).toBeInstanceOf(Promise)
		await expect(promise).resolves.toBeUndefined()
	})

	it('should wait for DOM updates', async () => {
		document.body.innerHTML = '<div id="test">original</div>'

		const div = document.getElementById('test')
		div.textContent = 'updated'

		expect(div.textContent).toBe('updated')

		let asyncValue = 'original'

		Promise.resolve().then(() => {
			asyncValue = 'changed'
		})

		expect(asyncValue).toBe('original')
		await nextTick()
		expect(asyncValue).toBe('changed')
	})
})