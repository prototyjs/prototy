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

	return {
		...p.bus,
		update: p.update.bind(p),
		destroy: () => p.destroy(p.bus.root)
	}
}
export {
	prototy,
	nextTick,
	isObject,
	isEqual,
	kebabToCamel
}