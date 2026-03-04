import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const utilsDir = path.join(__dirname, './src/utils')

const getFiles = (dir) => {
	const entries = fs.readdirSync(dir, { withFileTypes: true })
	const files = entries
		.filter(file => !file.isDirectory() && file.name.endsWith('.js'))
		.map(file => path.join(dir, file.name))
	const folders = entries.filter(file => file.isDirectory())
	for (const folder of folders) {
		files.push(...getFiles(path.join(dir, folder.name)))
	}
	return files
}

const runTests = async () => {
	const files = getFiles(utilsDir)

	for (const filepath of files) {
		const content = fs.readFileSync(filepath, 'utf8')
		const relativePath = path.relative(process.cwd(), filepath)

		const module = await import(`file://${filepath}`)

		await test(`File: ${relativePath}`, async (t) => {
			const exampleRegex = /@example\s+([\s\S]*?)(?=\s+\* @|\s+\*\/)/g
			let match

			while ((match = exampleRegex.exec(content)) !== null) {
				const exampleBody = match[1]
					.split('\n')
					.map(line => line.replace(/^\s*\*\s?/, '').trim())
					.filter(Boolean)
					.join(' ')

				if (exampleBody.includes('// =>')) {
					const [code, expectedStr] = exampleBody.split('// =>').map(s => s.trim())

					await t.test(`Example: ${code}`, () => {
						try {
					
							const context = { ...module }
							const execute = new Function(...Object.keys(context), `return ${code}`)

							const actual = execute(...Object.values(context))
							const expected = new Function(`return ${expectedStr}`)()

							assert.deepStrictEqual(actual, expected)
						} catch (err) {
							assert.fail(`Error: "${code}": ${err.message}`)
						}
					})
				}
			}
		})
	}
}

runTests()