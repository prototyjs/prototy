/**
 *
 */
export function applyModifier(value, modifier, args) {
	if (!modifier) return value
	const modifiers = {
		fixed: (n = 2) => Number(value).toFixed(n),
		int: (n = 10) => parseInt(value, n),
		abs: () => Math.abs(Number(value)),
		round: () => Math.round(Number(value)),
		clamp: (min = 0, max = 1) => Math.min(Math.max(Number(value), min), max),
		unit: (u = 'px') => Number(value) + u,
		trim: () => String(value).trim(),
		upper: () => String(value).toUpperCase(),
		lower: () => String(value).toLowerCase(),
		capitalize: () => {
			const s = String(value)
			return s.charAt(0).toUpperCase() + s.slice(1)
		},
		default: (def = '-') => (value || value === 0 ? value : def),
		json: () => JSON.stringify(value),
	}
	if (modifiers.hasOwnProperty(modifier)) {
		return modifiers[modifier](...args)
	} else {
		console.error('error modifier')
		return value
	}

}