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
	 * @param { string } name
	 * @param { any } value
	 * @param  { Array<string> } args
	 * @returns { any }
	 */
	transform(name, value, ...args) {
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