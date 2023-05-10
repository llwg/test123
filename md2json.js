#!/usr/bin/env -S deno run --allow-read

import { readAll } from 'https://deno.land/std@0.177.0/streams/mod.ts'
import { expandGlobSync } from "https://deno.land/std@0.170.0/fs/expand_glob.ts";

const doc = new TextDecoder().decode(await readAll(Deno.stdin))

Array.prototype.last = function() {
	return this[this.length - 1]
}

const title2short = x => x.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-')

const short2stills = short => [...expandGlobSync(`docs/media/${short}/*`)]
	.sort((x, y) => +x.name.match(/\d+/)[0] - +y.name.match(/\d+/)[0])
	.map(f => `media/${short}/${f.name}`)

let group = 'index'
// [{ group, short, title, content }]
const pages = [{ group: 'index', title: 'Jolinna Li', short: 'index', content: [] }]
for (const line of doc.split('\n')) {
	let m = null
	if (m = line.match(/^## (.+)/)) {
		pages.push({ group, title: m[1].trim(), content: [] })
	} else if (m = line.match(/^# (.+)/)){
		group = m[1].trim()
	} else if (m = line.match(/^!md:(.+)/)) {
		pages.last().md ??= m[1].trim()
	} else if (m = line.match(/^!yt:(.+)/)) {
		pages.last().yt ??= m[1].trim()
	} else {
		pages.last()?.content.push(line)
	}
}

const pages_processed = pages.map(p => {
	const short = title2short(p.title)
	const content = p.content.join('\n').trim()
	const stills = short2stills(short)
	return { short, stills, ...p, content }
})

const out = {}
for (const p of pages_processed) {
	if (out[p.short]) throw 'ununique short title: ' + p.short
	out[p.short] = p
}

console.log(JSON.stringify(pages_processed, null, '\t'))
