#!/usr/bin/env -S deno run --allow-read --allow-run

import { expandGlobSync } from "https://deno.land/std@0.170.0/fs/expand_glob.ts";

/* here, we perform random preparation stuff */

Array.prototype.to_h = function() { return Object.fromEntries(this) }
Object.prototype.to_a = function() { return Object.entries(this) }
Array.prototype.last = function() { return this[this.length - 1] }

const inputfile = Deno.args[0]
if (!inputfile) throw `args: <inputfile>`

const { pages: _pages, "pandoc-api-version": api_ver, meta } = JSON.parse(await Deno.readTextFile(inputfile))

const pandoc_blocks2html = async blocks => {
	const p = Deno.run({ cmd: ['pandoc', '-fjson', '-thtml'], stdout: 'piped', stdin: 'piped' })
	await p.stdin.write(new TextEncoder().encode(JSON.stringify({ blocks, "pandoc-api-version": api_ver, meta })))
	await p.stdin.close()
	const out = await p.output()
	p.close();
	return new TextDecoder().decode(out)
}

const pandoc_standard = async input => {
	const p = Deno.run({ cmd: ['pandoc'], stdout: 'piped', stdin: 'piped' })
	await p.stdin.write(new TextEncoder().encode(input))
	await p.stdin.close()
	const out = await p.output()
	p.close();
	return new TextDecoder().decode(out)
}

const FULLMONTHS = ['haha', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
	.map(x => x.toUpperCase())

// '2024.2' => whatever html
const date2datedisp = date => {
	const m = date.match(/(\d{4})\.(\d+)/)
	if (!m) throw `invalid date thing: ${date}`
	const [year, month] = m.slice(1).map(x => +x)
	return `<time>${FULLMONTHS[month]} ${year}</time>`
}

const short2stills = short => [...expandGlobSync(`docs/media/${short}/*`)]
	.sort((x, y) => +x.name.match(/\d+/)[0] - +y.name.match(/\d+/)[0])
	.map(f => `media/${short}/${f.name}`)

const short2writing = async short => {
	const got = [...expandGlobSync(`writing/${short}.md`)]
	if (got.length !== 1) return null
	return pandoc_standard(await Deno.readTextFile(got[0].path))
}

const pages = await Promise.all(_pages.map(async _page => {
	const page =
		{ ..._page
		, stills: short2stills(_page.id)
		, writing: await short2writing(_page.id)
		, blocks_html: (await pandoc_blocks2html(_page.blocks)).trim()
		}
	if (_page.date)
		page.date_display = date2datedisp(_page.date)
	page.title_sidebar ??= page.title_display
	return page
}))

console.log(JSON.stringify({ pages }))
