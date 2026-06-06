import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
	define: {
		'process.env.NODE_ENV': JSON.stringify('production')
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.js'),
			formats: ['es'],
			fileName: 'prototy'
		},
		sourcemap: false,
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