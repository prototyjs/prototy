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
	return p.bus
}
export {
	prototy,
	nextTick,
	isObject,
	isEqual,
	kebabToCamel
}