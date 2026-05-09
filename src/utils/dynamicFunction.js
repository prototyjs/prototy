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

				if (prop in bus) {
					return bus[prop]
				}

				if (prop === Symbol.unscopables) {
					return undefined
				}
				if (prop in window) {
					return window[prop]
				}
				log.error('ReferenceError: "{0}" is not defined', prop, el)
			},
			has(_, prop) {
				return prop !== key
			}
		})

		return fn(el, scopeProxy, local)
	}
}