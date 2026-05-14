import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prototy } from '@'

describe('Prototy Update & Setters Errors', () => {
	const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

	beforeEach(() => {
		consoleSpy.mockClear()
	})

	it('should log error when update receives non-string path', () => {
		const app = prototy({ state: { a: 1 } })

		app.update(null, 10)

		expect(consoleSpy).toHaveBeenCalled()
		const lastLog = consoleSpy.mock.lastCall[0]
		expect(lastLog).toContain('[PROTOTY] update() expects path to be a string')
	})

	it('should log error when update path is unreachable', () => {
		const app = prototy({ state: { a: { b: 1 } } })

		app.update('a.z.c', 100)

		expect(consoleSpy).toHaveBeenCalled()
		const lastLog = consoleSpy.mock.lastCall[0]
		expect(lastLog).toContain('[PROTOTY] Update error: path "a.z.c" is unreachable')
	})

	it('should log error when setter fails during state change', () => {
		const app = prototy({
			state: { x: 10 },
			setters: {
				x: () => {
					throw new Error('Custom Setter Crash')
				}
			}
		})

		app.state.x = 20

		expect(consoleSpy).toHaveBeenCalled()
		const lastLog = consoleSpy.mock.lastCall[0]
		expect(lastLog).toContain('[PROTOTY] Error in setter for "x": Custom Setter Crash')

		expect(app.state.x).toBe(10)
	})

	it('should successfully update value through update() method', () => {
		const app = prototy({ state: { user: { name: 'Bob' } } })

		app.update('user.name', 'Alex')

		expect(app.state.user.name).toBe('Alex')
		expect(consoleSpy).not.toHaveBeenCalled()
	})
})