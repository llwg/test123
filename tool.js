#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write --allow-env --allow-net

import { expandGlobSync } from "https://deno.land/std@0.170.0/fs/expand_glob.ts"
import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { serveFile, serveDir } from "https://deno.land/std@0.178.0/http/file_server.ts"

const tmpify = path => `${path}.tmp`

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

async function normalize_stills() {

	const fs = [...expandGlobSync(`docs/media/*/*`)]

	if (!fs.every(f => f.isFile)) throw 'why is there directory?'

	const groups = {}

	for (const { path, name } of fs) {
		const match = path.match(/([\w-]+)\/(\d+\.?\d*)\.(\w+)$/)
		if (!match) throw `unexpected filename: ${path}`
		const [, short, str_n, ext] = match

		if (!groups[short]) groups[short] = []

		groups[short].push([{path, name}, +str_n, ext])
	}

	const changes = []

	for (const [short, xs] of Object.entries(groups)) {
		xs.sort(([, a], [, b]) => a - b)
		let i = 1
		for (const [{path, name}, _, ext] of xs) {
			const new_name = `${i}.${ext}`
			if (new_name !== name) changes.push([path, `docs/media/${short}/${new_name}`, `${short}/${name} --> ${short}/${new_name}`])
			i += 1
		}
	}

	if (changes.length === 0) {
		console.log('no changes to be made all good!')
		Deno.exit(0)
	}

	console.log('=== changes to be made ===')

	console.log(changes.map(([,,x]) => x).join('\n'))

	waitfor_yes('are you sure you want to make these changes?')

	await Promise.all(changes.map(([x, y]) => Deno.rename(x, tmpify(y))))

	console.log('moved files to temporary thing...')

	await Promise.all(changes.map(([_, y]) => Deno.rename(tmpify(y), y)))

	console.log('ok renamed the files!')
}

// code simplified from https://deno.land/std@0.178.0/http/file_server.ts?s=serveDir
function host_local()
{
	serve(req => {
		const path = new URL(req.url).pathname
		if (!path.match(/^\/$|\.\w+$/)) {
			console.log(`rewrite ${path} --> docs${path}.html`)
			return serveFile(req, `docs${path}.html`)
		} else {
			return serveDir(req, { fsRoot: "docs" })
		}
	})
}

const cmd_lookup =
	{ clean
	, normalize_stills
	, host_local
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