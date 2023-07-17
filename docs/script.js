// { short: { title, page, group } }
const json = fetch('./site.json').then(r => r.json())

const SEARCH = document.querySelector('#search')
const CONTENT = document.querySelector('#content')
const DETAILS = [...document.querySelectorAll('details')]
const NAVAS = [...document.querySelectorAll('nav a')]

let set_interval = false // index floaty animation

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
			CONTENT.innerHTML = j[short].page
			if(short === 'index') {
				set_up_fun()
			} else {
				document.querySelector('#content').classList.remove('index-content')
			}

			CONTENT.style.transition='opacity ease-in 0.15s'
			CONTENT.style.opacity=1
		}, { once: true })
	})

// override nav links with dynamic page load
for (const a of NAVAS) {
	a.onclick = e => {
		const short = a.getAttribute('short')
		json.then(j => {
			// close unnecessary open groups
			DETAILS.forEach(d => d.open = d.getAttribute('group') === j[short].group)

			// update .current-page (before page fade in and out)
			document.querySelectorAll('.current-page').forEach(e => e.classList.remove('current-page'))
			NAVAS.find(a => a.getAttribute('short') === short).classList.add('current-page') // css selector ok?
		})
		if (curr_short !== short) {
			if (set_interval !== false) {
				clearInterval(set_interval)
				set_interval = false
			}
			clear_search()
			display(short).then(_ => history.pushState({ short }, '', a.href))
			curr_short = short
		}
		e.preventDefault()
	}
}

// handle browser back button
window.addEventListener('popstate', e => display(e.state?.short ?? short_base))

/* SEARCH STUFF */
function clear_search(){
	SEARCH.value = ''
	// this is probably doing this duplicate in some cases but oh well?.
	json.then(j => {
		DETAILS.forEach(d => d.open = d.getAttribute('group') === j[curr_short].group)
	})

	for (const e of document.querySelectorAll('.title-searchable')) {
		e.innerText = e.getAttribute('title')
	}


}
SEARCH.addEventListener('focusout', _ => {
	// by default retain search results (esp bc if u want to click on them it might close before u can click on them)
	// but if there are no open search results open the current page group
	if (!DETAILS.some(d => d.open)) {
		json.then(j => {
			DETAILS.forEach(d => d.open = d.getAttribute('group') === j[curr_short].group)
		})
	}
})
SEARCH.addEventListener('input', _ => {
	if (SEARCH.value === '') {
		clear_search()
		return
	}
	const term = new RegExp(SEARCH.value, 'i')
	const active_groups = new Set()
	for (const e of document.querySelectorAll('.title-searchable')) {
		const match = e.getAttribute('title').match(term)
		if (!match) {
			if (e.getAttribute('title') !== e.innerHTML)
				e.innerHTML = e.getAttribute('title')
			continue
		}
		active_groups.add(e.getAttribute('group'))
		e.innerHTML = e.getAttribute('title').replace(term, '<mark>$&</mark>')
	}
	DETAILS.forEach(d => d.open = active_groups.has(d.getAttribute('group')))
})

/* GRAPH STUFF */

const stills = ["111-film/2.webp","barbies-bitch-bites-back/1.webp","barbies-bitch-bites-back/2.webp","barbies-bitch-bites-back/3.webp","barbies-bitch-bites-back/4.webp","barbies-bitch-bites-back/5.webp","brunch/2.webp","col-and-olga/2.webp","crosswalk/1.webp","crosswalk/2.webp","crosswalk/3.webp","crosswalk/4.webp","crosswalk/5.webp","crosswalk/6.webp","crosswalk/7.webp","crosswalk/8.webp","fairytale/1.webp","fairytale/2.webp","fairytale/3.webp","fairytale/4.webp","fairytale/5.webp","fairytale/6.webp","fairytale/7.webp","finding-eden/4.webp","finding-eden/9.webp","flaming-fists/1.webp","flaming-fists/2.webp","flaming-fists/3.webp","flaming-fists/5.webp","good-goods/1.webp","good-goods/7.webp","good-goods/9.webp","good-goods/11.webp","jazz-club/7.webp","kettle-boils-while-watched/1.webp","me-and-my-babysitter/1.webp","me-and-my-babysitter/2.webp","me-and-my-babysitter/3.webp","me-and-my-babysitter/4.webp","me-and-my-babysitter/5.webp","me-and-my-babysitter/6.webp","me-and-my-babysitter/7.webp","me-and-my-babysitter/8.webp","me-and-my-babysitter/9.webp","me-and-my-babysitter/10.webp","me-and-my-babysitter/11.webp","me-and-my-babysitter/12.webp","me-and-my-babysitter/13.webp","me-and-my-babysitter/14.webp","me-and-my-babysitter/15.webp","me-and-my-babysitter/16.webp","me-and-my-babysitter/17.webp","me-and-my-babysitter/18.webp","me-and-my-babysitter/19.webp","me-and-my-babysitter/20.webp","the-redemption-of-mr-greg/2.webp","the-redemption-of-mr-greg/3.webp","wreck/1.webp","wreck/2.webp","wreck/3.webp","wreck/4.webp","wreck/5.webp","wreck/6.webp","wreck/7.webp","wreck/8.webp","a-rolling-stone-gathers-no-moss/1.webp","a-rolling-stone-gathers-no-moss/10.webp","a-rolling-stone-gathers-no-moss/11.webp","a-rolling-stone-gathers-no-moss/2.webp","a-rolling-stone-gathers-no-moss/3.webp","a-rolling-stone-gathers-no-moss/4.webp","a-rolling-stone-gathers-no-moss/5.webp","a-rolling-stone-gathers-no-moss/6.webp","a-rolling-stone-gathers-no-moss/7.webp","a-rolling-stone-gathers-no-moss/8.webp","a-rolling-stone-gathers-no-moss/9.webp"]
	.map(x => `media/${x}`)

Array.prototype.rande = function() {
	return this[Math.floor(Math.random() * this.length)]
}

// may explode
Array.prototype.randes = function(n) {
	const res = new Set()
	while (res.size < n) res.add(this.rande())
	return [...res]
}

// i copy and pasted this from some demo
function drag(simulation) {
	function dragstarted(event) {
		if (!event.active) simulation.alphaTarget(0.3).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	}

	function dragged(event) {
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	}

	function dragended(event) {
		if (!event.active) simulation.alphaTarget(0);
		event.subject.fx = null;
		event.subject.fy = null;
	}

	return d3.drag()
		.on("start", dragstarted)
		.on("drag", dragged)
		.on("end", dragended);
}

const nodes =
	[ {id:"a", height: 280, x: -526.7114978358869,   y: -27.954213546407182          , up: '-12%', over: '-90%'}
	, {id:"b", height: 320, x:    8.059866961236306, y: -481.31970185434225          , up: '-88%', over: '-50%'}
	, {id:'c', height: 360, x:  519.2927754935764,   y:  505.2944150332749          , up: '-12%', over: '-40%'}
	]
const links =
	[ { source: "a", target: "b", distance: 700, thick: 8, xShift: -33, back_dx: -30, back_dy: 0 }
	, { source: "b", target: "c", distance: 1110, thick: 8, xShift: 33, back_dx: -30, back_dy: 0 }
	]

const change_images = _ => {
	const imgs = stills.randes(nodes.length)
	for (let i=0;i<imgs.length; i+=1) {
		nodes[i].img = imgs[i]
	}
}

change_images()

document.querySelector('#name').addEventListener('click', _ => {
	if (curr_short === 'index')
		change_images()
})

let floati = 0

function set_up_fun()
{
	// note: should be here rn.
	document.querySelector('#content').classList.add('index-content')

	const forceNode = d3.forceManyBody().strength(-Math.sin(floati) * (770 + Math.random() * 4))

	const forceLink = d3.forceLink(links)
		.distance(x => x.distance)
		.id(x => x.id)

	const forceCenter = d3.forceCenter().strength(.05)

	const simulation = d3.forceSimulation(nodes)
		.force("link", forceLink)
		.force("charge", forceNode)
		.force("center", forceCenter)
		.on("tick", ticked)
		.alphaDecay(.001)
		.alpha(.25)
		.alphaTarget(0)

	const svg = d3.select('#fun')

	const linkBACK = svg.append("g")
		.attr('stroke', '#000')
		.attr("stroke-linecap", 'round')
		.selectAll("line")
		.data(links)
		.join("line")
		.attr("stroke-width", x => x.thick)

	set_interval = setInterval(_ => {
		forceNode.strength(-Math.sin(floati) * (770 + Math.random() * 7))
		forceCenter.strength(0.05 + 0.008 * Math.random())
		simulation.alpha(0.25)
		floati += 0.15
	}, 200)

	const umm = svg.selectAll('image')
		.data(nodes)
		.join(enter => enter.append("svg:image")
			.attr('xlink:href', x => x.img)
			.attr('height', d => d.height)
			.style('position', 'absolute')
			.style('top', '100%')
			.style('left', '50%')
			.style('transform-box', 'fill-box')
			.style('transform', x => `translate(${x.over}, ${x.up})`)
		, update => update, exit => exit.remove())
		.call(drag(simulation))

	const link = svg.append("g")
		.attr('stroke', '#000')
		.attr("stroke-linecap", 'round')
		.selectAll("line")
		.data(links)
		.join("line")
		.attr("stroke-width", x => x.thick);

	function ticked() {
		umm.attr("x", d => d.x)
		umm.attr("y", d => d.y)
		.attr('xlink:href', x => x.img)

		link
			.attr("x1", d => d.source.x + d.xShift)
			.attr("y1", d => d.source.y)
			.attr("x2", d => d.target.x + d.xShift)
			.attr("y2", d => d.target.y);

		linkBACK
			.attr("x1", d => d.source.x + d.back_dx + d.xShift)
			.attr("y1", d => d.source.y + d.back_dy)
			.attr("x2", d => d.target.x + d.back_dx + d.xShift)
			.attr("y2", d => d.target.y + d.back_dy)
	}

}

if(curr_short === 'index') set_up_fun()
