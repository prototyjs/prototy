import { setDeepValue } from '@/utils/setDeepValue'
import { log } from '@/log'

/**
 * @param { HTMLElement } element
 * @param { any } value
 * @param { string } property
 * @param { Array<string> } args
 * @param { string } code
 * @param { object } bus
 * @param { import('./modifiers/modifiers.js').Modifiers } modifiers
 */
export function bind(element, value, property, args, code, bus, modifiers) {
	const isWritable = code.startsWith('state.') || code.startsWith('item.')
	if (!isWritable) {
		log.error(
			'Invalid bind path "{0}". Path must start with "state." (e.g., state.text)',
			code,
			element,
		)
		return
	}

	const modifierArgs = [...args]
	const eventType = modifierArgs.shift() || 'input'
	const eventName = 'on' + eventType

	const modifierName = modifierArgs.shift()
	const remainingModifierArgs = modifierArgs

	if (element[property] !== value) {
		element[property] = value ?? ''
	}

	if (!element._bound) {
		element._bound = {}
	}

	if (element._bound[eventName] && element._bound[eventName] !== property) {
		log.error('Conflict "{0}" already taken by "{1}".', eventName, property, element)
		return
	}

	if (!element._bound[eventName]) {
		const handler = () => {
			const result = modifiers.apply(modifierName, element[property], ...remainingModifierArgs)
			setDeepValue(bus.state, code, result)
		}

		Object.defineProperty(element, eventName, {
			get: () => handler,
			set: () => {
				log.error('Channel "{0}" is occupied by bind "{1}".', eventName, code, element)
			},
			configurable: true,
			enumerable: true,
		})

		element._bound[eventName] = property
	}
}
