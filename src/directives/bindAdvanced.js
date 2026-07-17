import { log } from '@/log'
/**
 * @param { HTMLElement } element
 * @param { string } key
 * @param { object } binding - { get, set }
 * @param { object } args - { el, els, props }
 * @param { Function } transform
 */
export function bindAdvanced(element, key, binding, args, transform) {
	// eslint-disable-next-line sonarjs/no-unused-vars
	const [_, property, ...modifiers] = key.split('.')
	// _ = 'bind', property = 'value', modifiers = ['input', 'trim', 'lower']

	const eventType = modifiers[0] || 'input'
	const eventName = 'on' + eventType

	const modifierName = modifiers[1] || null
	const modifierArgs = modifiers.slice(2)

	const rawValue = binding.get.call(args)
	const transformedValue = transform(rawValue, modifierName, modifierArgs)
	if (element[property] !== transformedValue && transformedValue !== undefined) {
		element[property] = transformedValue ?? ''
	}
	if (!element._bound) {
		element._bound = {}
	}
	if (element._bound[eventName] && element._bound[eventName] !== property) {
		log.error('Conflict "{0}" already taken by "{1}".', eventName, element._bound[eventName], element)
		return
	}
	if (!element._bound[eventName]) {
		const handler = () => {
			binding.set.call(args, transform(element[property], modifierName, modifierArgs))
		}
		element.addEventListener(eventType, handler)
		Object.defineProperty(element, eventName, {
			get: () => handler,
			set: () => {
				log.error('Channel "{0}" is occupied by bind "{1}".', eventName, property, element)
			},
			configurable: true,
			enumerable: true
		})
		element._bound[eventName] = property
	}
}