#!/usr/bin/env -S deno run --allow-read

Array.prototype.to_h = function() { return Object.fromEntries(this) }
Object.prototype.to_a = function() { return Object.entries(this) }
Array.prototype.last = function() { return this[this.length - 1] }

const inputfile = Deno.args[0]
if (!inputfile) throw `args: <inputfile>`

const j = JSON.parse(await Deno.readTextFile(inputfile))

const i2text = inline => {
	const handlers =
		{ Str: ({ c }) => c
		, Space: _ => ' '
		}
	if (!handlers[inline.t]) throw `unsupported inline: ${JSON.stringify(inline)}`
	return handlers[inline.t](inline)
}

const is2text = is => is.map(i2text).join('')

const propcode2props = text => text.trim().split(/\n+/)
	.map(line => {
		const m = line.match(/^(\w+)\s+(.+)$/)
		if (!m) throw `unparseable line: ${line}`
		return m.slice(1)
	}).to_h()

const title2short = text => text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-')

const pages = []
let curr_group = null

for (const block of j.blocks) {
	if (block.t === 'Header') {
		const [n, attr, is] = block.c
		const title_display = is2text(is)
		const id = title2short(title_display)

		if (n === 1) {
			curr_group = title_display
		} else if (n === 2) {
			pages.push({ group: curr_group, id, title_display, blocks: [] })
		} else {
			throw `level 3+ headers not supported`
		}
	} else if (block.t === 'CodeBlock') {
		const [attr, text] = block.c
		pages.push({ ...pages.pop(), ...propcode2props(text) })
	} else {
		pages.last().blocks.push(block)
	}
}

console.log(JSON.stringify({ pages, "pandoc-api-version": j["pandoc-api-version"], meta: j.meta }))
