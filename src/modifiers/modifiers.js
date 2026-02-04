/**
 *
 */
export function applyModifier(value, modifier, args) {
	if (!modifier) return value
	const modifiers = {
		fixed: (n = 2) => Number(value).toFixed(n),
		int: () => parseInt(value, 10),
		trim: () => String(value).trim(),
		upper: () => String(value).toUpperCase(),
		lower: () => String(value).toLowerCase(),
		capitalize: () => {
			const s = String(value)
			return s.charAt(0).toUpperCase() + s.slice(1)
		},
		default: (def = '-') => (value || value === 0 ? value : def),
		json: () => JSON.stringify(value),
		add: (t) => value + t
	}
	if (modifiers.hasOwnProperty(modifier)) {
		return modifiers[modifier](...args)
	} else {
		console.error('error modifier')
		return value
	}

}