/**
 * @param { Function } callback
 * @returns { Promise }
 */
export function nextTick(callback) {
	if (callback) {
		return Promise.resolve().then(callback)
	}
	return Promise.resolve()
}