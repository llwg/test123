const json = fetch('./site.json').then(r => r.json())

const CONTENT = document.querySelector('#content')
const DETAILS = [...document.querySelectorAll('details')]
const NAVAS = [...document.querySelectorAll('nav a')]

let curr_short = short_base

// enforce one category open at a time
DETAILS.forEach((d, i) => {
	d.addEventListener('click', e => {
		if (e.target.tagName !== 'SUMMARY') return
		const should_be_open_now = !e.target.parentElement.open

		if (!should_be_open_now)
			DETAILS.forEach(x => x.open = false)
		else
			DETAILS.forEach((x, j) => x.open = i === j)

		e.preventDefault()
	})
})

// dynamically display page content from short code
const display = short =>
	json.then(j => {
		CONTENT.style.transition='opacity ease-in 0.1s'
		CONTENT.style.opacity=0

		CONTENT.addEventListener('transitionend', e => {
			document.title = j[short].title
			CONTENT.innerHTML = j[short].content
			document.querySelectorAll('.current-page').forEach(e => e.classList.remove('current-page'))
			NAVAS.find(a => a.getAttribute('short') === short).classList.add('current-page') // css selector ok?
			DETAILS.forEach(d => d.open = d.getAttribute('group') === j[short].group)

			if (short === 'index') do_grid_things()

			CONTENT.style.transition='opacity ease-in 0.15s'
			CONTENT.style.opacity=1
		}, { once: true })
	})

// override nav links with dynamic page load
for (const a of NAVAS) {
	a.onclick = e => {
		const short = a.getAttribute('short')
		if (curr_short !== short) {
			display(short).then(_ => history.pushState({ short }, '', a.href))
			curr_short = short
		}
		e.preventDefault()
	}
}

// handle browser back button
window.addEventListener('popstate', e => display(e.state?.short ?? short_base))

/* EXPERIIMENTAL GRID THINGS */

function do_grid_things()
{
	const ws = [...document.querySelectorAll('#welcome-grid .img-container')]

	const rows = [[]]
	for (const w of ws) {
		const row = rows.length - 1
		const col = rows[row].length
		if (w.classList.contains('thr')) {
			rows[row].push(w, w, w)
		} else if (w.classList.contains('two')) {
			rows[row].push(w, w)
		} else if (w.classList.contains('six')) {
			rows[row].push(w, w, w, w, w, w)
		}
		if (rows[row].length === 6) rows.push([])
	}

	let r = 0
	let c = 0
	for (const w of ws) {
		const col = rows[r].length
		let neighbors = null
		if (w.classList.contains('thr')) {
			neighbors = [rows[r][c-1], rows[r][c+3+1], ...[-1, 0, 1, 2, 3].map(off => [rows[r-1]?.[c+off], rows[r+1]?.[c+off]]).flat()]
			c += 3
		} else if (w.classList.contains('two')) {
			neighbors = [rows[r][c-1], rows[r][c+2+1], ...[-1, 0, 1, 2].map(off => [rows[r-1]?.[c+off], rows[r+1]?.[c+off]]).flat()]
			c += 2
		} else if (w.classList.contains('six')) {
			neighbors = [0, 1, 2, 3, 4, 5].map(off => [rows[r-1]?.[c+off], rows[r+1]?.[c+off]]).flat()
			c += 6
		}
		if (c === 6) {
			c = 0
			r += 1
		}

		const ns = [...new Set(neighbors)].filter(x => x)

		w.addEventListener('mouseover', _ => {
			ns.forEach(n => n.classList.add('shrunken'))
		})
		w.addEventListener('mouseout', _ => {
			ns.forEach(n => n.classList.remove('shrunken'))
		})
	}
}

if (short_base === 'index') do_grid_things()