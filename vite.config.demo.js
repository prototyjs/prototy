import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
	const isDev = command === 'serve'

	return {
		root: 'demo',
		base: './',
		resolve: {
			alias: {
				'@prototy': isDev
					? resolve(__dirname, 'src/index.js')
					: resolve(__dirname, 'dist/prototy.js'),
				'@': resolve(__dirname, 'src')
			}
		},
		server: {
			port: 5173,
			open: true,
			host: true,
			fs: {
				allow: ['..']
			}
		}
	}
})