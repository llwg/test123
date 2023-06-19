// { short: { title, page, group } }
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
			CONTENT.innerHTML = j[short].page
			if(short === 'index') {
				set_up_fun()
			} else {
				document.querySelector('#content').classList.remove('index-content')
			}
			document.querySelectorAll('.current-page').forEach(e => e.classList.remove('current-page'))
			NAVAS.find(a => a.getAttribute('short') === short).classList.add('current-page') // css selector ok?
			DETAILS.forEach(d => d.open = d.getAttribute('group') === j[short].group)

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

/* GRAPH STUFF */

const stills = ["111-film/1.webp","111-film/2.webp","111-film/3.webp","111-film/4.webp","111-film/5.webp","111-film/6.webp","111-film/7.webp","111-film/8.webp","barbies-bitch-bites-back/1.webp","barbies-bitch-bites-back/2.webp","barbies-bitch-bites-back/3.webp","barbies-bitch-bites-back/4.webp","barbies-bitch-bites-back/5.webp","brunch/1.webp","brunch/2.webp","brunch/3.webp","col-and-olga/1.webp","col-and-olga/2.webp","col-and-olga/3.webp","col-and-olga/4.webp","col-and-olga/5.webp","crosswalk/1.webp","crosswalk/2.webp","crosswalk/3.webp","crosswalk/4.webp","crosswalk/5.webp","crosswalk/6.webp","crosswalk/7.webp","crosswalk/8.webp","crosswalk/9.webp","eyes-on-me/1.webp","eyes-on-me/10.webp","eyes-on-me/2.webp","eyes-on-me/3.webp","eyes-on-me/4.webp","eyes-on-me/5.webp","eyes-on-me/6.webp","eyes-on-me/7.webp","eyes-on-me/8.webp","eyes-on-me/9.webp","fairytale/1.webp","fairytale/2.webp","fairytale/3.webp","fairytale/4.webp","fairytale/5.webp","fairytale/6.webp","fairytale/7.webp","finding-eden/1.webp","finding-eden/10.webp","finding-eden/11.webp","finding-eden/12.webp","finding-eden/13.webp","finding-eden/14.webp","finding-eden/2.webp","finding-eden/3.webp","finding-eden/4.webp","finding-eden/5.webp","finding-eden/6.webp","finding-eden/7.webp","finding-eden/8.webp","finding-eden/9.webp","flaming-fists/1.webp","flaming-fists/2.webp","flaming-fists/3.webp","flaming-fists/4.webp","flaming-fists/5.webp","good-goods/1.webp","good-goods/10.webp","good-goods/11.webp","good-goods/2.webp","good-goods/3.webp","good-goods/4.webp","good-goods/5.webp","good-goods/6.webp","good-goods/7.webp","good-goods/8.webp","good-goods/9.webp","growing-and-leaving/1.webp","growing-and-leaving/10.webp","growing-and-leaving/2.webp","growing-and-leaving/3.webp","growing-and-leaving/4.webp","growing-and-leaving/5.webp","growing-and-leaving/6.webp","growing-and-leaving/7.webp","growing-and-leaving/8.webp","growing-and-leaving/9.webp","haiku-film/1.webp","haiku-film/2.webp","haiku-film/3.webp","jazz-club/1.webp","jazz-club/2.webp","jazz-club/3.webp","jazz-club/4.webp","jazz-club/5.webp","jazz-club/6.webp","jazz-club/7.webp","jazz-club/8.webp","kettle-boils-while-watched/1.webp","kettle-boils-while-watched/2.webp","kettle-boils-while-watched/3.webp","me-and-my-babysitter/1.webp","me-and-my-babysitter/10.webp","me-and-my-babysitter/11.webp","me-and-my-babysitter/12.webp","me-and-my-babysitter/13.webp","me-and-my-babysitter/14.webp","me-and-my-babysitter/15.webp","me-and-my-babysitter/16.webp","me-and-my-babysitter/17.webp","me-and-my-babysitter/18.webp","me-and-my-babysitter/19.webp","me-and-my-babysitter/2.webp","me-and-my-babysitter/20.webp","me-and-my-babysitter/3.webp","me-and-my-babysitter/4.webp","me-and-my-babysitter/5.webp","me-and-my-babysitter/6.webp","me-and-my-babysitter/7.webp","me-and-my-babysitter/8.webp","me-and-my-babysitter/9.webp","ozymandias/1.webp","the-redemption-of-mr-greg/1.webp","the-redemption-of-mr-greg/2.webp","the-redemption-of-mr-greg/3.webp","wreck/1.webp","wreck/2.webp","wreck/3.webp","wreck/4.webp","wreck/5.webp","wreck/6.webp","wreck/7.webp","wreck/8.webp"]
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

function set_up_fun()
{
	document.querySelector('#content').classList.add('index-content')
	const nodes =
		[ {id:"a", height: .16, x: -0.2643022933322303, y: -0.11449823564709087, up: '-10%', over: '-90%'}
		, {id:"b", height: .18, x: -0.005146078604313987, y: -0.31811742200468, up: '-90%', over: '-50%'}
		, {id:'c', height: .20, x: 0.26944596567566426, y: 0.4326304962874532, up: '-10%', over: '-40%'}
		]
	const links =
		[ { source: "a", target: "b", distance: .33, thick: .012, xShift: -.033, back_dx: -.03, back_dy: 0 }
		, { source: "b", target: "c", distance: .80, thick: .015, xShift: .033, back_dx: -.03, back_dy: 0 }
		]

	const forceNode = d3.forceManyBody().strength(.0002)

	const forceLink = d3.forceLink(links)
		.distance(x => x.distance)
		.id(x => x.id)

	const simulation = d3.forceSimulation(nodes)
		.force("link", forceLink)
		.force("charge", forceNode)
		.force("center",  d3.forceCenter().strength(.05))
		.on("tick", ticked);

	const svg = d3.select('#fun')

	console.log(svg)

	const linkBACK = svg.append("g")
		.attr('stroke', '#000')
		.attr("stroke-linecap", 'round')
		.selectAll("line")
		.data(links)
		.join("line")
		.attr("stroke-width", x => x.thick)

	const thumbs = stills.randes(3)

	const umm = svg.selectAll('image') // ?
		.data(nodes)
		.join(enter => enter.append("svg:image")
			.attr('xlink:href', x => thumbs[x.index])
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