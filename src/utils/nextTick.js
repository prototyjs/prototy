/**
 * @param { Function } callback
 * @returns { Promise }
 */
export function nextTick(callback) {
	const wait = () => new Promise(resolve => {
		queueMicrotask(() => {
			// eslint-disable-next-line sonarjs/no-nested-functions
			requestAnimationFrame(() => {
				resolve()
			})
		})
	})

	if (callback) {
		return wait().then(callback)
	}
	return wait()
}