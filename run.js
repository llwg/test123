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
				<p>hello my friend. green filename in upper left corner represent photo that is SELECTED. when you load page, it will select all photos that are currently displayed on main page. Please click photos to select or deselect photos as you please. Then, copy and paste the list in the text area below containing filenames either to site maintainer person, or just into docs/stills.json (thats what maintainer person will do anyways). have a nice day</p>
				<textarea id=output>hi. if you are seeing this message for more than like 4 seconds thats a bad sign</textarea>
				<h3>jump to section</h3>
				<ul>${fs_sorted.map(([short]) => `<li><a href='#${short}'>${short}</a>`).join('')}</ul>
			</div>
			</div>
		</body>
	<script src=tool.js></script>`)
}

await Promise.all([minify_css(), dosite(), doTool()])
