import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const utilsDir = path.join(__dirname, './src/utils')

// Рекурсивный поиск файлов
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

		// Динамический импорт модуля
		const module = await import(`file://${filepath}`)

		await test(`Файл: ${relativePath}`, async (t) => {
			// Регулярка ищет блоки @example и содержимое до конца комментария или следующего тега
			const exampleRegex = /@example\s+([\s\S]*?)(?=\s+\* @|\s+\*\/)/g
			let match

			while ((match = exampleRegex.exec(content)) !== null) {
				const exampleBody = match[1]
					.split('\n')
					.map(line => line.replace(/^\s*\*\s?/, '').trim())
					.filter(Boolean)
					.join(' ')

				// Парсим конструкцию: вызов // => результат
				if (exampleBody.includes('// =>')) {
					const [code, expectedStr] = exampleBody.split('// =>').map(s => s.trim())

					await t.test(`Пример: ${code}`, () => {
						try {
							// Создаем контекст для выполнения примера
							// Добавляем функции модуля в область видимости eval
							const context = { ...module }
							const execute = new Function(...Object.keys(context), `return ${code}`)

							const actual = execute(...Object.values(context))
							const expected = new Function(`return ${expectedStr}`)()

							assert.deepStrictEqual(actual, expected)
						} catch (err) {
							assert.fail(`Ошибка в "${code}": ${err.message}`)
						}
					})
				}
			}
		})
	}
}

runTests()