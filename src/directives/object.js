import { isObject } from '@/utils/isObject.js'

/**
 *
 * @param { HTMLElement } element
 * @param { object } value
 * @param { string } modifier
 * @param { Array<string> } args
 * @param { string } directive
 * @returns { any }
 */
export function object(element, value, modifier, args, directive) {
	if (!isObject(value)) {
		return
	}

	const targetProperty = modifier || directive

	if (targetProperty === 'dataset' || targetProperty === 'data') {
		Object.assign(element.dataset, value)
		return
	}

	if (targetProperty in element) {
		Object.assign(element[targetProperty], value)
	}
}