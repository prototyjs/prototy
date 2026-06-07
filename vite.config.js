import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => ({
	esbuild: {
		drop: mode === 'production' ? ['console', 'debugger'] : []
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
				compact: true,
				freeze: false
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
}))