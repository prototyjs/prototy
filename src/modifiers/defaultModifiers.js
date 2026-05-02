export default {
	/**
	 * @param {any} value
	 * @param {number} [n=2]
	 * @returns {string}
	 */
	fixed: (value, n = 2) => Number(value).toFixed(n),
	/**
	 * @param {any} value
	 * @param {number} [n=10]
	 * @returns {number}
	 */
	int: (value, n = 10) => parseInt(value, n),
	/**
	 * @param {any} value
	 * @returns {number}
	 */
	abs: (value) => Math.abs(Number(value)),
	/**
	 * @param {any} value
	 * @returns {number}
	 */
	round: (value) => Math.round(Number(value)),
	/**
	 * @param {any} value
	 * @param {number} [min=0]
	 * @param {number} [max=1]
	 * @returns {number}
	 */
	clamp: (value, min = 0, max = 1) => Math.min(Math.max(Number(value), min), max),
	/**
	 * @param {any} value
	 * @param {string} [u='px']
	 * @returns {string}
	 */
	unit: (value, u = 'px') => Number(value) + u,
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	trim: (value) => String(value).trim(),
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	upper: (value) => String(value).toUpperCase(),
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	lower: (value) => String(value).toLowerCase(),
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	capitalize: (value) => String(value).charAt(0).toUpperCase() + String(value).slice(1),
	/**
	 * @param {any} value
	 * @param {string} [def='-']
	 * @returns {any}
	 */
	default: (value, def = '-') => (value || value === 0 ? value : def),
	/**
	 * @param {any} value
	 * @returns {string}
	 */
	json: (value) => JSON.stringify(value)
}