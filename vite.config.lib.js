import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/prototy.js'),
			name: 'Prototy',
			fileName: (format) => `prototy.${format}.js`,
			formats: ['es', 'umd', 'iife']
		},
		rollupOptions: {
			output: {
				// Глобальное имя для UMD/IIFE сборки
				globals: {
					prototy: 'Prototy'
				},
				// Минимизация
				compact: true
			}
		},
		outDir: 'dist',
		emptyOutDir: true,
		sourcemap: true,
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true
			}
		}
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'@utils': resolve(__dirname, './src/utils')
		}
	}
})