import { isObject } from '@/utils/isObject.js'

/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifier
 * @param { Array<string> } args
 * @param { string } code
 * @param { Function } transform
 */
export function property(element, value, modifier, args, code, transform) {
	if (isObject(value)) {
		Object.assign(element[code], value)
		return
	}

	if (typeof element[code] === 'boolean') {
		element[code] = Boolean(v)
	} else {
		element[code] = v ?? ''
	}
}