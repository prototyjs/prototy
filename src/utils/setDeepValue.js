/**
 * @param { object } obj
 * @param { string } path
 * @param { any } val
 */
export function setDeepValue(obj, path, val) {
	const keys = path.split('.')
	const lastKey = keys.pop()
	const target = keys.reduce((acc, k) => (acc && acc[k] ? acc[k] : acc), obj)
	if (target && target[lastKey] !== val) {
		target[lastKey] = val
	}
}