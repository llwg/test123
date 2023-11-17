#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

import * as csso from './csso.esm.js'
import { md2json } from './md2json.js'
import { generate_site } from './json2site.js'
import { expandGlobSync } from 'https://deno.land/std@0.170.0/fs/expand_glob.ts'

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

const doTool = async _ => {
	const fs = {}

	for (const {path} of [...expandGlobSync(`docs/media/*/*`)]) {
		const match = path.match(/\/([^\/]+)\/([^\/]+)\.(\w+)$/)
		if (!match) throw `unexpected filename when generating tool page: ${path}`
		const [, short, name, ext] = match
		fs[short] ??= []
		fs[short].push([name, `${name}.${ext}`])
	}

	const fs_sorted = Object.entries(fs).map(([k, vs]) => [k, vs.sort(([a], [b]) => +a - +b)])

	const site = fs_sorted.map(([short, files]) => {

		return `<h2 id='${short}'>${short}</h2><div class=pics>${files.map(([name, full]) => {
			const fullPath = `media/${short}/${full}`
			return `<div class=image fullPath='${fullPath}'><img src='../${fullPath}'><span class=image-text>${full}</text></div>`
		}).join('')}</div>`
	})
	await Deno.writeTextFile('docs/tool/tool.html', `<link rel=stylesheet href=tool.css>
		<body>
			<div>${site}</div>
			<div id=infopane_wrapper>
			<div id=infopane>
				<h1>tool to select images</h1>
				<p>here you can select images and a text will be generated representing your selection which is very handy and good and can be shared by copy and pasting it to someone. have a nice day</p>
				<textarea id=output>select an images to begin generating a selection. or, paste something in and press the "import" button.</textarea><button id=import-button>click here to "import" i.e. based on the current text, go through and select the things.</button>
				<h3>jump to section</h3>
				<ul>${fs_sorted.map(([short]) => `<li><a href='#${short}'>${short}</a>`).join('')}</ul>
			</div>
			</div>
		</body>
	<script src=tool.js></script>`)
}

await Promise.all([minify_css(), dosite(), doTool()])
