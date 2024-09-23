#!/usr/bin/env -S deno run --allow-read --allow-write

/* here, we generate site */

Array.prototype.to_h = function() { return Object.fromEntries(this) }
Object.prototype.to_a = function() { return Object.entries(this) }
Array.prototype.last = function() { return this[this.length - 1] }

const output_dir = Deno.args[0]
const inputfile = Deno.args[1]
if (!inputfile) throw `args: <inputfile> <output dir>`

const ISIN = (...groups) => group => groups.includes(group)
// str (group) => bool
const IS_FILM = ISIN('narrative', 'experimental', 'film')
const IS_PHOTOGRAPHY = ISIN('photography')
const IS_SINGLE = ISIN('about')
const IS_WRITING = ISIN('writing')

const PAGEGEN =
	[ [IS_FILM, ({ title_display, yt, md, stills, date_display, blocks_html }) => {
		const yt_disp = yt
			? `<iframe class=film-yt src="https://www.youtube.com/embed/${yt}" title="YouTube player for ${title_display}" frameborder=0 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
			: ''
		const stills_disp = stills.length === 0
			? ''
			: `<div class=stills>${stills.map(src => `<img class=still src='${src}'>`).join('')}</div>`
		const date = date_display
			? date_display
			: ''

		return `<div class=film-intro><h2 class=film-title>${title_display}</h2>`
			+ `<div class=film-details><span>${date}</span><span>${md}</span></div>${blocks_html}</div>`
			+ yt_disp + stills_disp
	}]
	, [IS_PHOTOGRAPHY, ({ title_display, stills, blocks_html }) => {
		const stills_disp = stills.length === 0
			? ''
			: `<div class=stills>${stills.map(src => `<img class=still src='${src}'>`).join('')}</div>`

		return `<div class=photography-intro><h2 class=photography-title>${title_display}</h2>${blocks_html}</div>`
			+ stills_disp
	}]
	, [IS_WRITING, async ({ title_display, id, date_display, writing }) => {
		if (!writing) throw `writing has no writing: ${title_display} ${id}`
		// const writing_content = await pandoc_markdown(writing)
		return `<div class=story>
		<h2>${title_display}</h2>
		<span class=story-date>${date_display}</span>
		<hr>${writing}</div>`
	}]
	, [g => g === 'about', ({title_display, blocks_html}) => `<div><h2>${title_display}</h2></div>${blocks_html}`]
	, [g => g === 'index', ({ blocks_html }) => blocks_html]
	]

const page2htmlcontent = async p => {
	const gen = PAGEGEN.find(([pred]) => pred(p.group))

	if (!gen) throw `no generator for group: ${p.group}`

	const [, f] = gen

	return f(p)
}

// normal form for links
const short2path = short => short === 'index'
	? '.' // so you can host in a folder if you want
	: `${short}`

// generate nav for `curr` page
const navstuff = ({ pages, navs }) => curr => navs.map(g => {

}).filter(x => x).join('')

const section2navsection = selected_page => ({ t, name, page, pages }) => {
	if (t === 'single') {
		return `<a short='${page.id}' href='${short2path(page.id)}'${page.id === selected_page.id ? ' class=current-page' : ''}>${name}</a>` // alert: bad hack
	} else if (t === 'group') {
		return `<details group='${name}'${name === selected_page.group ? ' open' : ''}>
			<summary>${name}</summary>
			<ul>
				${pages.map(({ title_sidebar, id, md, stills, htmlpath }) => {
					const thumbnail = md
						? `<img class=thumb src='${stills[0]}'>`
						: ''
					return `<li><a short='${id}' class='${selected_page.id === id ? 'current-page ' : ''}title' href='${htmlpath}'>
						${thumbnail}
						<span class=title-searchable group=${name}">${title_sidebar}</span>
					</a>`
				}).join('')}
			</ul>
		</details>`
	}
}

const page2ogdescription = p => {
	const {group} = p
	if (group === 'film')
		return `A film by Jolinna Li`
	if (group === 'experimental')
		return `An experimental film by Jolinna Li`
	if (group === 'narrative')
		return `A narrative film by Jolinna Li`
	if (group === 'photography')
		return `A series of photos taken by Jolinna Li`
	else
		throw `page2description error: ${JSON.stringify(p)}`
}

const page2og = p => !IS_FILM(p.group) && !IS_PHOTOGRAPHY(p.group)
	? `` :
	`<meta property='og:title' content="${p.title_display /* NOTE: titles may have single quotes */}" />
<meta property='og:description' content="${page2ogdescription(p)}" />
<meta property='og:image' content="https://jolinnali.github.io/${p.stills[0]}" />`

// { ...page, page } => string
const page2sitehtml = ({ figureheadgen, sections }) => p => `<!DOCTYPE html>
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-5RJJVBLRBV"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-5RJJVBLRBV');
</script>
<title>${p.title_display}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta charset="UTF-8">
${page2og(p)}
<link rel="icon" type="image/png" sizes="32x32" href="${p.path2root}/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="${p.path2root}/favicon-16x16.png">
<link rel=stylesheet href="${p.path2root}/style.css">
</head>

<body>
	<div id=header>
		<nav>
			<a short=index id=name href=./${p.id === 'index' ? ' class=current-page' : ''}>Jolinna Li</a>
			${sections.map(section2navsection(p)).join('')}
			${extranav}
		</nav>
	</div>
	<div id=content short=${p.id}>
		${p.htmlcontent}
	</div>
</body>
<script>const short_base = '${p.id}'; const path2root = '${p.path2root}'</script>

${ /* scripts */
	["d3.v7.min.js", "d3-dispatch@3.js", "d3-quadtree@3.js", "d3-timer@3.js", "d3-force@3.js", "script.js"]
	.map(src => `<script src="${p.path2root}/stuff/${src}"></script>`).join('')
}

`.replace(/^\t+/mg, '').replace(/$\n+/mg, ' ')

const partition = pred => xs => {
	const yes = [], no = []
	for (const x of xs) (pred(x) ? yes : no).push(x)
	return [yes, no]
}

// Hashable h => (a -> h) -> [a] -> { h: [a] }
const group = f => xs => {
	const res = {}
	for (const x of xs) {
		const key = f(x)
		res[key] ??= []
		res[key].push(x)
	}
	return res
}

const section2pages = ({ t, page, pages }) => t === 'single'
	? [page]
	: pages

const dirpath2path2root = dirpath => dirpath === '.'
	? '.'
	: dirpath.split('/').map(_ => '..').join('/')


const write_verbose = async (x, y) => {
	await Deno.writeTextFile(x, y)
	console.error(`wrote to ${x} (${y.length} chars)`)
}

const sectionify = pages => group(p => p.group)(pages)
	.to_a()
	.map(([grp, pages]) => {
		if (grp === 'about') {
			if (pages.length !== 1) throw `Must only be one About page!!`
			return { t: 'single', name: grp, page: pages[0] }
		} else {
			return { t: 'group', name: grp, pages }
		}
	})

const pages2sitejson = pages => pages
	.map(({ htmlcontent, title_display, group, id }) => [id, { page: htmlcontent, title_display, group }])
	.to_h()

const { pages: _pages } = JSON.parse(await Deno.readTextFile(inputfile))

const path2root = dirpath2path2root(output_dir)

const pages = await Promise.all(_pages.map(async _page => {
	const { id } = _page
	const page =
		{ ..._page
		, htmlpath: id === 'index' ? '.' : id
		, output_path: `${output_dir}/${id}.html`
		, path2root: path2root
		, stills: _page.stills.map(path => `${path2root}/${path}`)
		}
	page.htmlcontent = await page2htmlcontent(page)
	return page
}))

let extranav = ''
for (const { extranav: _extranav } of pages) { // this is crazy
	if (_extranav == null) continue
	for (const { name, href } of JSON.parse(_extranav)) {
		extranav += `<a href='${href}'>${name}</a>` // alert: bad hack
	}
}

const sections = sectionify(pages)
	.filter(({ name }) => name !== 'index')

await Promise.all(pages.map(page =>
	write_verbose(`docs/${page.output_path}`, page2sitehtml({ output_dir, sections })(page))
))

await write_verbose(`docs/${output_dir}/site.json`, JSON.stringify(pages2sitejson(pages)))
