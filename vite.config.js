import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
	define: {
		'process.env.NODE_ENV': '"production"'
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.js'),
			formats: ['es'],
			fileName: 'prototy'
		},
		sourcemap: true,
		minify: 'esbuild',
		rollupOptions: {
			output: {
				compact: true
			},
			external: []
		},
		emptyOutDir: true
	},
	publicDir: false,
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src')
		}
	}
})