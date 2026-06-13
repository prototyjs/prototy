import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => ({
	esbuild: {
		drop: mode === 'production' ? ['console', 'debugger'] : []
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.js'),
			formats: ['es', 'iife'],
			name: 'Prototy',
			fileName: (format) => `prototy.${format === 'es' ? 'es' : 'global'}.js`
		},
		sourcemap: false,
		minify: 'esbuild',
		rollupOptions: {
			output: {
				compact: true,
				freeze: false,
				exports: 'named'
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