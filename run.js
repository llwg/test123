#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

import * as csso from './csso.esm.js'
import { md2json } from './md2json.js'
import { generate_site } from './json2site.js'

const minify_css = async _ => {
	const css = await Deno.readTextFile('site.css')
	await Deno.writeTextFile('docs/style.css', csso.minify(css).css + '\n')
	console.log('wrote minified css to docs/style.css')
}

const dosite = async _ => {
	const md = await(Deno.readTextFile('site.md'))
	const json = await md2json(md)
	return generate_site(json)
}

await Promise.all([minify_css(), dosite()])
