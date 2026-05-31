import { Prototy } from '@/prototy'
import { nextTick } from '@/utils/nextTick'
import { isObject } from '@/utils/isObject'
import { isEqual } from '@/utils/isEqual'
import { kebabToCamel } from '@/utils/kebabToCamel'

/**
 * @param { object } options
 * @returns { object }
 */
function prototy(options) {
	const p = new Prototy(options)

	let isDestroyed = false

	return {
		...p.bus,
		update: p.update.bind(p),
		destroy: () => {
			if (isDestroyed) {
				return
			}
			p.destroy(p.bus.root)
			p.pendingTargets?.clear()
			p.activeSetters?.clear()
			p.bus = null
			isDestroyed = true
		}
	}
}
export {
	prototy,
	nextTick,
	isObject,
	isEqual,
	kebabToCamel
}