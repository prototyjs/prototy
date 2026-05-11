import { isObject } from '@/utils/isObject.js'

/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } modifier
 * @param { Array<string> } args
 * @param { Function } transform 
 * @param { string } directive
 */
export function property(element, value, modifier, args, transform, directive) {

	if (isObject(value)) {
		Object.assign(element[directive], value)
		return
	}

	const v = transform(value, modifier, args)

	if (typeof element[directive] === 'boolean') {
		element[directive] = Boolean(v)
	} else {
		element[directive] = v ?? ''
	}
}