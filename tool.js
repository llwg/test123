#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write --allow-env --allow-net

import * as csso from './csso.esm.js'
import { expandGlobSync } from "https://deno.land/std@0.170.0/fs/expand_glob.ts"
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { serveFile, serveDir } from "https://deno.land/std@0.178.0/http/file_server.ts"

const ENC = new TextEncoder()
const run_bash = async cmd => {
	const p = Deno.run({ cmd: ['bash'], stdin: 'piped' })
	await p.stdin.write(ENC.encode(cmd))
	await p.stdin.close()
	return p.status()
}

const run_cmd = cmd => {
	const p = Deno.run({ cmd })
	return p.status()
}

// [a] -> (a -> bool) -> [[a], [a]]
Array.prototype.partition = function(f) {
	const xs = []
	const ys = []
	for (const x of this) {
		if (f(x)) xs.push(x)
		else ys.push(x)
	}
	return [xs, ys]

}

function waitfor_yes(txt) {
	console.log(`%c! ${txt} (yes/no)`, `text-decoration: underline; color: #f0f`)
	let ans = prompt(`your input: `)
	while (ans !== 'yes' && ans !== 'no') {
		console.log('%c! please respond with either `yes` or `no`', `text-decoration: underline; color: #f0f`)
		ans = prompt(`your input: `)
	}
	if (ans !== 'yes') {
		console.error('! exited due to `no` response')
		Deno.exit(0)
	}
}

async function clean() {
	const status = await run_bash('rm -f docs/*.html docs/*.json')
	console.log(`OK cleaned!! (status: ${JSON.stringify(status)})`)
}

async function rename_stills() {

	const fs = [...expandGlobSync(`docs/media/*/*`)]

	if (!fs.every(f => f.isFile)) throw 'why is there directory?'

	const groups = {}

	for (const { path, name: filename } of fs) {
		const match = path.match(/\/([^\/]+)\/([^\/]+)\.(\w+)$/)
		if (!match) throw `unexpected filename: ${path}`

		const [, short, name, ext] = match

		if (filename !== `${name}.${ext}`) throw `program logic error: ${filename}`

		groups[short] ??= []
		groups[short].push({ short, name, n: +name, ext })
	}

	const changes = []

	for (const [short, xs] of Object.entries(groups)) {
		const [not_nums, nums] = xs.partition(x => isNaN(x.n))
		nums.sort((a, b) => a.n - b.n)
		let i = 1
		for (const { name, ext } of nums) {
			const old_name = `${name}.${ext}`
			const new_name = `${i}.${ext}`
			if (new_name !== old_name)
				changes.push([`${short}/${old_name}`, `${short}/${new_name}`])
			i += 1
		}

		// tries to sort at least a little
		const attempt_number = str => +(str.match(/\d+/)?.[0] ?? 0)
		not_nums.sort((a, b) => attempt_number(a.name) - attempt_number(b.name))
		for (const { name, ext } of not_nums) {
			changes.push([`${short}/${name}.${ext}`, `${short}/${i++}.${ext}`])
		}
	}

	if (changes.length === 0) {
		console.log('no changes to be made all good!')
		Deno.exit(0)
	}

	console.log('%c=== changes to be made ===', 'color: #f0f')

	for (const [x, y] of changes) {
		console.log(`${x} %c==> %c${y}`, 'color: #f0f', 'color: unset')
	}

	waitfor_yes('are you sure you want to make these changes?')

	console.log('moving files to temporary thing...')
	await Promise.all(changes.map(([x, _]) => Deno.rename(`docs/media/${x}`, `docs/media/${x}.tmp`)))
	console.log('OK')

	console.log('moving temporary things back renamed...')
	await Promise.all(changes.map(([x, y]) => Deno.rename(`docs/media/${x}.tmp`, `docs/media/${y}`)))
	console.log('OK all done!')
}

async function stills2webp() {

	const fs = [...expandGlobSync(`docs/media/*/*`)]

	if (!fs.every(f => f.isFile)) throw 'why is there directory?'

	const changes = []
	const known_extensions = new Set(['jpg', 'png', 'webp'])

	for (const { path, name: filename } of fs) {
		const match = path.match(/\/([^\/]+)\/([^\/]+)\.(\w+)$/)
		if (!match) throw `unexpected filename: ${path}`

		const [, short, name, ext] = match

		if (filename !== `${name}.${ext}`) throw `program logic error: ${filename}`
		if (!known_extensions.has(ext)) throw `unrecognized file extension: ${filename}`

		if (ext !== 'webp') {
			const src = `${short}/${name}.${ext}`
			const dst = `${short}/${name}.webp`
			try { // ugly logic for `push change if nothing is in dst spot`
				await Deno.stat(`docs/media/${dst}`)
				throw `i would need to overwrite this file (please move it somewhere else): ${dst}`
			} catch (e) {
				if (e.name === 'NotFound')
					changes.push([src, dst])
				else
					throw e
			}
		}
	}

	if (changes.length === 0) {
		console.log('no changes to be made all good!')
		Deno.exit(0)
	}

	console.log('%c=== changes to be made ===', 'color: #f0f')

	for (const [x, y] of changes) {
		console.log(`${x} %c==> %c${y}`, 'color: #f0f', 'color: unset')
	}

	waitfor_yes('are you sure you want to make these changes?')

	console.log('converting to webp...')
	await Promise.all(changes.map(([x, y]) => run_cmd(['convert', `docs/media/${x}`, `docs/media/${y}`])))
	console.log('OK!')

	console.log('removing original images...')
	await Promise.all(changes.map(([x, _]) => Deno.remove(`docs/media/${x}`)))
	console.log('OK all done!')
}

// code simplified from https://deno.land/std@0.178.0/http/file_server.ts?s=serveDir
function host_local()
{
	serve(req => {
		const path = new URL(req.url).pathname
		if (!path.match(/\/$|\.\w+$/)) {
			console.log(`rewrite ${path} --> docs${path}.html`)
			return serveFile(req, `docs${path}.html`)
		} else {
			return serveDir(req, { fsRoot: "docs" })
		}
	})
}

function dump_stills()
{
	console.error("DUMPING STILLS HEHE")
	const fs = [...expandGlobSync(`docs/media/*/*`)]
		.map(({ path }) => {
			const match = path.match(/\/([^\/]+)\/([^\/]+)\.(\w+)$/)
			if (!match) throw `unexpected filename: ${path}`
			const [, short, name, ext] = match
			if (short === 'profile') return null
			return `${short}/${name}.${ext}`
		}).filter(x => x)
	console.log(JSON.stringify(fs))
	console.error("OK")
}

async function minify_css()
{
	const css = await Deno.readTextFile('site.css')
	await Deno.writeTextFile('docs/style.css', csso.minify(css).css + '\n')
	console.log('wrote minified css to docs/style.css')
}

const generate_tool = async _ => {
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
	console.error("OK did tool")
}

const cmd_lookup =
	{ clean
	, rename_stills
	, host_local
	, stills2webp
	, dump_stills
	, minify_css
	, generate_tool
	}

const f = cmd_lookup[Deno.args[0]]

if (!f) {
	console.error(`unknown command: ${Deno.args[0]}`)
	console.error('here is list of all commands: ')
	console.error(Object.keys(cmd_lookup))
	Deno.exit(1)
} else {
	await f(...Deno.args.slice(1))
}
