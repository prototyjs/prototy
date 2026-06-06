import { readFileSync, writeFileSync } from 'fs'
import { marked } from 'marked'
import hljs from 'highlight.js'

hljs.configure({
	cssSelector: 'code',
	mangle: false,
	silent: true
})

const extensions = [
	{
		name: 'table',
		level: 'block',
		renderer(token) {
			const header = token.header.map(cell =>
				`<th>${marked.parseInline(cell.text)}</th>`
			).join('')
			const body = token.rows.map(row =>
				// eslint-disable-next-line sonarjs/no-nested-template-literals
				`<tr>${row.map(cell => `<td>${marked.parseInline(cell.text)}</td>`).join('')}</tr>`
			).join('')

			return `
                <table class="table table-striped table-dark">
                <thead><tr>${header}</tr></thead>
                <tbody>${body}</tbody>
                </table>
            `
		}
	},
	{
		name: 'heading',
		level: 'block',
		renderer(token) {
			const text = token.text
			const level = token.depth
			const id = text.toLowerCase().replace(/[^\w\u0400-\u04FF]+/g, '-')
			return `<h${level} id="${id}">${text}</h${level}>`
		}
	},
	{
		name: 'blockquote',
		level: 'block',
		renderer(token) {
			const text = token.text || token.raw
			if (text.startsWith('>!')) {
				const content = text.slice(2).trim()
				return `
                    <blockquote class="important">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
                            <title>Let op</title>
                            <path fill-rule="evenodd" d="M24.5 33.002a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9m-3.06-4.44L20.5 6h8l-.94 22.563A1.5 1.5 0 0 1 26.061 30h-3.122a1.5 1.5 0 0 1-1.499-1.437"/>
                        </svg>
                        ${marked.parse(content)}
                    </blockquote>
                `
			} else {
				const content = text.replace(/^> /, '').trim()
				return `<blockquote class="note">${marked.parse(content)}</blockquote>`
			}
		}
	},
	{
		name: 'code',
		level: 'block',
		renderer(token) {
			const meta = token.lang?.split('|') || []
			const lang = meta[0] || 'plaintext'
			const language = hljs.getLanguage(lang) ? lang : 'plaintext'
			const code = token.text
			const highlighted = hljs.highlight(code, { language }).value
			const link = meta[1] ? `<a href="${meta[1]}" target="_blank" class="code-link">🔗</a>` : ''

			return `<pre><code class="language-${language}">${highlighted}</code>${link}</pre>`
		}
	}
]
marked.use({
	extensions,
	pedantic: false,
	gfm: true,
	breaks: false,
	smartLists: true,
	smartypants: false,
	xhtml: false
})

/**
 *
 */
async function generate() {
	console.log(`Marked version: ${marked.version || 'unknown'}`)

	try {
		const mdContent = readFileSync('./README.md', 'utf-8')

		const htmlContent = await marked.parse(mdContent)

		const template = `
		<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="./reset.css">
    <link rel="stylesheet" href="./general.css">
    <link rel="stylesheet" href="./style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/stackoverflow-light.min.css">
    <link rel="preconnect" href="https://cdn.jsdelivr.net"/>
    <script src="./main.js" defer></script>
</head>
<body>
<div class="screen lstUI">
    <div class="sidebar">
        <div class="lstSidebar opened">
            <div class="lstBackdrop"></div>
            <div class="lstSidebarWr">
                <div class="top"></div>
                <div class="middle"></div>
                <div class="bottom"></div>
            </div>
        </div>
    </div>
    <div class="main">
        <div class="menu l-fx l-jc-sb"></div>
        <div class="container txt">
            <div class="tabs"></div>
            <div class="content">
                {{CONTENT}}
            </div>
        </div>
        <div class="more l-fx l-jc-sb l-ai-b">
            <a class="edit l-fx l-ai-c" href="/public" title="Edit On GitHub" target="_blank">
                <span>Edit On GitHub</span>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve" fill="#101010">
                <path d="M69.3,23.2L69.3,23.2l7.1,7.1L33.5,73.1l-7.9,1.1l0.9-8.2L69.3,23.2C69.3,23.2,69.3,23.2,69.3,23.2 M69.3,18.2c-1.3,0-2.6,0.5-3.5,1.5l-44,44L20,80l15.9-2.2l44-44c2-2,2-5.1,0-7.1l-7.1-7.1C71.9,18.7,70.6,18.2,69.3,18.2L69.3,18.2z"/>
            </svg>
            </a>
            <div class="socialMenu"></div>
        </div>
    </div>
</div>
</body>
</html>`
		const finalHtml = template.replace('{{CONTENT}}', htmlContent)
		writeFileSync('./public/index.html', finalHtml)
		console.log(`✅ public/index.html: ${finalHtml.length} `)

	} catch (error) {
		console.error('❌ Error:', error.message)
		console.error(error.stack)
	}
}

generate()