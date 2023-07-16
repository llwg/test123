#!/usr/bin/env -S deno run --allow-read

import { expandGlobSync } from "https://deno.land/std@0.170.0/fs/expand_glob.ts";

Array.prototype.last = function() {
	return this[this.length - 1]
}

const title2short = x => x.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-')

const short2stills = short => [...expandGlobSync(`docs/media/${short}/*`)]
	.sort((x, y) => +x.name.match(/\d+/)[0] - +y.name.match(/\d+/)[0])
	.map(f => `media/${short}/${f.name}`)

const short2writing = async short => {
	const got = [...expandGlobSync(`writing/${short}.md`)]
	if (got.length !== 1) return null
	return Deno.readTextFile(got[0].path)
}

const md2json = async md => {
	let group = 'index'
	const vals = new Set()
	// [{ group, short, title, content }]
	const pages = [{ group: 'index', title: 'Jolinna Li', short: 'index', content: [] }]
	for (const line of md.split('\n')) {
		let m = null
		if (m = line.match(/^## (.+)/)) {
			pages.push({ group, title: m[1].trim(), content: [] })
		} else if (m = line.match(/^# (.+)/)){
			group = m[1].trim()
		} else if (m = line.match(/^!(\w+):(.+)/)) {
			const last = pages.last()
			const [, key, val] = m
			vals.add(key)
			if (last[key]) throw `error: ${last.title} already has key: ${key}`
			last[key] = val.trim()
		} else {
			pages.last()?.content.push(line)
		}
	}

	console.error(`handling keys: ${[...vals].join(', ')}`)

	const pages_processed = await Promise.all(pages.map(async p => {
		const short = title2short(p.title)
		const content = p.content.join('\n').trim()
		const stills = short2stills(short)
		const writing = await short2writing(short)
		return { short, stills, ...p, content, writing }
	}))

	const check = {}
	for (const p of pages_processed) {
		if (check[p.short]) throw 'ununique short title: ' + p.short
		check[p.short] = p
	}

	return pages_processed
}

export { md2json }
