import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
	const isProduction = mode === 'production'
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
		build: {
			outDir: resolve(__dirname, 'dist-demo'),
			emptyOutDir: true,
			rollupOptions: {
				input: resolve(__dirname, 'demo/index.html')
			},
			minify: isProduction ? 'esbuild' : false,
			sourcemap: !isProduction
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