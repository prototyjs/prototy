import { log } from '@/log'
/**
 * @param { string } code
 * @param { object } bus
 * @param { string } [key='']
 * @returns { Function }
 */
export function dynamicFunction(code, bus, key = '') {
	const localDeclaration = key ? `const ${key} = local` : ''

	// eslint-disable-next-line sonarjs/code-eval
	const fn = new Function('el', 'scope', 'local', `
        ${localDeclaration}
        with(scope) {
            try {
                return ${code}
            } catch (err) {
                console.warn('Runtime error in expression:', err)
                return undefined
            }
        }
    `)

	return (el, context, local) => {
		const scopeProxy = new Proxy({}, {
			get(_, prop) {

				if (prop === 'el') {
					return el
				}

				const fromContext = context[prop]
				if (fromContext !== undefined) {
					return fromContext
				}

				if (prop in bus.state) {
					return bus.state[prop]
				}

				if (prop in bus.methods) {
					return bus.methods[prop]
				}

				if (prop in bus.params) {
					return bus.params[prop]
				}

				if (prop === 'root') {
					return bus.root
				}

				if (prop === 'components') {
					return bus.components
				}

				if (prop === 'els') {
					return bus.els
				}

				if (prop === Symbol.unscopables) {
					return undefined
				}
				if (prop in window) {
					return window[prop]
				}
				log.error('ReferenceError: "{0}" is not defined', prop, el)
			},
			set(_, prop, value) {
				if (prop in bus.state) {
					bus.state[prop] = value
					return true
				}
				if (context && typeof context === 'object' && prop in context) {
					context[prop] = value
					return true
				}
				log.error(`Cannot set "${prop}" - property does not exist in state or context`, el)
				return false
			},
			has(_, prop) {
				return prop !== key
			}
		})

		return fn(el, scopeProxy, local)
	}
}