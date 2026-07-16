import { isObject } from '@/utils/isObject'

/**
 * @param { object } components
 * @returns { object }
 */
export function mapComponents(components = {}) {
	return Object.fromEntries(
		Object.entries(components).map(([key, value]) => {
			if (typeof value === 'string') {
				return [key, { name: key, template: value }]
			}
			if (isObject(value)) {
				return [key, { name: key, ...value }]
			}
			return [key, { name: key, template: '' }]
		})
	)
}