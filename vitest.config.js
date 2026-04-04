import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
	test: {
		environment: 'happy-dom',
		globals: true,
		include: ['tests/**/*.test.js'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.js'],
			exclude: ['tests/**', '**/*.test.js']
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
})