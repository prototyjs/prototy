import { isEqual } from '@/utils/isEqual'
/**
 * @param { object } target
 * @param { string } property
 * @param { any } oldValue
 * @param { any } newValue
 * @returns { boolean }
 */
export function shouldTrigger(target, property, oldValue, newValue) {
	const isArray = Array.isArray(target)
	const isIndex = isArray && !isNaN(Number(property))
	const isLength = isArray && property === 'length'
	const hasChanged = !isEqual(oldValue, newValue)

	if (isIndex) {
		return false
	}
	return hasChanged || isLength
}