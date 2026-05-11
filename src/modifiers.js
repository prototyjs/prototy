import defaultModifiers from '@/modifiers/defaultModifiers'
import { log } from '@/log'

/**
 * @typedef { object } ModifiersConfig
 */
export class Modifiers {
	/** @type { Record<string, Function> } */
	modifiers
	/**
	 * @param { object } clientModifiers
	 */
	constructor(clientModifiers = {}) {
		this.modifiers = { ...defaultModifiers, ...clientModifiers }
	}

	/**
	 * @param { any } value
	 * @param { string } name
	 * @param  { Array<string> } args
	 * @returns { any }
	 */
	transform(value, name, ...args) {
		if (!name) {
			return value
		}

		if (Object.hasOwn(this.modifiers, name)) {
			return this.modifiers[name](value, ...args)
		}

		log.error(`Unknown modifier '${name}'`)
		return value
	}
}