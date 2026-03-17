export const modifiers = {
	/**
	 * 
	 * @param {*} value 
	 * @param {number} n 
	 * @returns {string}
	 */
	fixed: (value, n = 2) => Number(value).toFixed(n),
	/**
	 * 
	 * @param {*} value 
	 * @param {number} n 
	 * @returns {number}
	 */
	int: (value, n = 10) => parseInt(value, n),
	/**
	 * 
	 * @param {*} value 
	 * @returns {number}
	 */
	abs: (value) => Math.abs(Number(value)),
	/**
	 * 
	 * @param {*} value 
	 * @returns {number}
	 */
	round: (value) => Math.round(Number(value)),
	/**
	 * 
	 * @param {*} value 
	 * @param {number} min 
	 * @param {number} max 
	 * @returns {number}
	 */
	clamp: (value, min = 0, max = 1) =>
		Math.min(Math.max(Number(value), min), max),
	/**
	 * 
	 * @param {*} value 
	 * @param {string} u 
	 * @returns {string}
	 */
	unit: (value, u = 'px') => Number(value) + u,
	/**
	 * 
	 * @param {*} value 
	 * @returns {string}
	 */
	trim: (value) => String(value).trim(),
	/**
	 * 
	 * @param {*} value 
	 * @returns {string}
	 */
	upper: (value) => String(value).toUpperCase(),
	/**
	 * 
	 * @param {*} value 
	 * @returns {string}
	 */
	lower: (value) => String(value).toLowerCase(),
	/**
	 * 
	 * @param {*} value 
	 * @returns {string}
	 */
	capitalize: (value) =>
		String(value).charAt(0).toUpperCase() + String(value).slice(1),
	/**
	 * 
	 * @param {*} value 
	 * @param {string} def 
	 * @returns {*}
	 */
	default: (value, def = '-') => (value || value === 0 ? value : def),
	/**
	 * 
	 * @param {*} value 
	 * @returns {string}
	 */
	json: (value) => JSON.stringify(value)
}