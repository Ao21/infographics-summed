import * as d3 from 'd3';
import * as _ from 'lodash';
import {Subject} from 'rxjs/Rx';

import {Utils} from './../../common/utils';
import {Colors} from './../../common/colours';
import {SunburstHaloUtils} from './sunburst_halo_data';
import {WorldProjection} from './../projection/projection';
import {SunburstHaloInfo} from './sunburst_halo_info';
import * as recursive from 'lodash-recursive';

export class SunburstHalo {
	info: SunburstHaloInfo = new SunburstHaloInfo();
	worldProjection: WorldProjection = new WorldProjection();
	scope: any = {};
	background: any;
	vis: any;
	g: any;
	plot: any;
	arcPlot: any;
	worldPlot: any;

	sunburstArcs: any[];

	partitionLayout: any;
	arc: any;
	arcData: any;

	c: Colors = new Colors();

	colors = d3.scale.category20();
	colorRange: any;

	nodes: any;
	x: any;
	y: any;

	path: any;

	currentDepth = 0;
	selectedNode: any;

	mouseOut: Subject<any> = new Subject();
	mouseOver: Subject<any> = new Subject();

	constructor() {
		this.mouseOut.throttleTime(50).subscribe((next) => {
			if (next.TYPE !== 'Hidden') {
				this.arcPlot.selectAll("path")
					.style("opacity", 1)
					.filter(function (node) {
						return node.TYPE !== 'Hidden';
					})
					.style("fill", (d) => {
						return this.colorRange(d.value);
					});

				// this.arcPlot.selectAll("path")
				// 	.filter((node) => {
				// 		return node === next;
				// 	}).style("opacity", 1)
				// 	.style("fill", (d) => {
				// 		return this.c.blue(100)
				// 	});
			}

		});
		this.mouseOver.debounceTime(50).subscribe((next) => {
			if (next.TYPE !== 'Hidden') {
				this.info.setCountryInfo(next);
				this.info.setTitle(next.COUNTRY_NAME);
				this.info.setCountryInfo(next);
				let ancestors = SunburstHaloUtils.getAncestors(next);
				this.info.createAncestors(ancestors);

				this.arcPlot.selectAll("path")
					.style("opacity", 0.3)
					.filter(function (node) {
						return node.TYPE !== 'Hidden';
					})
					.style("fill", (d) => {
						return this.colorRange(d.value);
					});;
				this.arcPlot.selectAll("path")
					.filter(function (node) {
						return (ancestors.indexOf(node) >= 0);
					}).style("opacity", 0.9)
					.style("fill", (d) => {
						return this.c.darkBlue(100)
					});

				this.arcPlot.selectAll("path")
					.filter((node) => {
						return node === next;
					}).style("opacity", 1)
					.style("fill", (d) => {
						return this.c.darkBlue(100)
					});

				this.worldProjection.transition(next.MAP_COUNTRY ? next.MAP_COUNTRY.split(';') : 'default');
			}
		})
	}

	init(data: any) {
		this.scope = _.extend(this.scope, SunburstHaloUtils.defs());
		this.scope.data = data;
		this.prepData();
		
		
		this.info.setTitle(this.scope.data[0].COUNTRY_NAME);
		this.vis = d3.select('#graph')
			.append("svg:svg")
			.attr('id', this.scope.id)
			.style("overflow", "visible")

		this.background =
			this.vis.append("rect")
				.attr("class", "vz-background")
				.style("fill", "transparent");
		this.worldPlot = this.vis.append("g").attr("class", "un-world-plot");
		let g = this.worldProjection.init(this.worldPlot);
		g.style('position', 'absolute')
		g
			.style('position', 'absolute')
			.style('top', this.scope.size.height / 2 - (250 / 2) + 'px')
			.style('left', this.scope.size.width / 2 - (250 / 2) + 'px')
			// .style("pointer-events", "none")
			.on("click", this.reset);
		this.g = this.vis.append("g").attr("class", "vz-halo-viz");
		this.plot = this.g.append("g").attr("class", "vz-halo-plot").attr("clip-path", "url(#" + this.scope.id + "_plotClipPath)");

		this.arcPlot = this.plot.append("g").attr("class", "vz-arc-plot");

		this.x = d3.scale.linear().range([0, 2 * Math.PI]);
		this.y = d3.scale.sqrt().range([0, 100]);

		this.measure();
		this.update();
		this.info.setPrice(this.arcData.value);
	}

	prepData() {
		this.scope.data = _.filter(this.scope.data, (e: any) => { return e.YEAR === 2016; });
		this.sunburstArcs =
			d3.nest()
				.key((e: any) => { return e.CATEGORY; })
				.key((e: any) => { return e.FUNDING_CATEGORY; })
				.entries(this.scope.data);

		this.sunburstArcs = Utils.unNester(this.sunburstArcs);
		this.arcData = { name: "root", values: SunburstHaloUtils.sumAmounts(this.sunburstArcs) }

		// _.each(this.arcData.children, (e) => {
		// 	console.log(e);
		// })
		this.colors.domain(SunburstHaloUtils.getIds(this.scope.data));

	}

	measure() {
		this.partitionLayout = d3.layout.partition()
			.size([2 * Math.PI, 100])
			.value((d) => { return d.value })
			.children((d: any, depth) => { return depth < 4 ? d.values : null })

		this.arc = d3.svg.arc()
			.padAngle(0.01)
			.startAngle((d: any) => { return d.x; })
			.endAngle((d: any) => { return d.x + d.dx; })
			.innerRadius((d: any) => {
				return SunburstHaloUtils.innerR(this.scope.radius, d);
			})
			.outerRadius((d: any) => {
				return SunburstHaloUtils.outerR(this.scope.radius, d);
			});

		this.nodes = this.partitionLayout
			.nodes(this.arcData);

	}

	update() {
		this.colorRange = d3
			.scale
			.linear()
			.domain([0, _.maxBy(this.nodes, (e: any) => { if (e.name != 'root') { return e.value } }).value])
			.range([this.c.darkBlue(25), this.c.darkBlue(100)]);

		let gColorRange = d3
			.scale
			.linear()
			.domain([0, _.maxBy(this.nodes, (e: any) => { if (e.name != 'root') { return e.value } }).value])
			.range([this.c.yellow(25), this.c.yellow(100)]);

		let rColorRange = d3
			.scale
			.linear()
			.domain([0, _.maxBy(this.nodes, (e: any) => { if (e.name != 'root') { return e.value } }).value])
			.range([this.c.red(25), this.c.red(100)]);

		this.vis.attr("width", this.scope.size.width).attr("height", this.scope.size.height);
		this.background.attr("width", this.scope.size.width).attr("height", this.scope.size.height);
		this.plot.style("width", this.scope.size.width).style("height", this.scope.size.height).attr("transform", "translate(" + this.scope.size.left + "," + this.scope.size.top + ")");
		this.arcPlot.attr("transform", "translate(" + this.scope.size.width / 2 + "," + this.scope.size.height / 2 + ")");
		this.path = this.arcPlot.selectAll("path")
			.data(this.nodes)
			.enter().append("svg:path")
			.on("mouseover", (d, i) => this.mouseOver.next(d))
			.on("mouseout", (d, i) => this.mouseOut.next(d))
			.on("click", this.click)
			.attr("display", function (d) { return d.depth ? null : "none"; })
			.attr("d", this.arc)
			.attr("fill-rule", "evenodd")
			.style("fill", (d) => {
				if (d.TYPE === 'Hidden') {
					return 'white';
				}
				return this.colorRange(d.value);

			})
			.style("opacity", 1)
			.each(this.stash)
			.transition()
			.duration(750)
			.attrTween("d", this.arcTween);

	}

	stash = (d) => {
		d.x0 = 0; // d.x;
		d.dx0 = 0; //d.dx;
	}

	arcTween = (a) => {
		var i = d3.interpolate({ x: a.x0, dx: a.dx0 }, a);
		return (t) => {
			var b: any = i(t);
			a.x0 = b.x;
			a.dx0 = b.dx;
			return this.arc(b);
		};
	}

	getParent(d) {
		if (d.depth !== this.currentDepth + 1) {
			return this.getParent(d.parent);
		}
		return d;
	}

	reset = (d) => {
		d3.select("#graph").selectAll("path").remove();
			this.nodes = this.partitionLayout
				.nodes(this.arcData)
			this.update();
	}
	click = (d) => {
		let node = d;
		if (d.depth !== this.currentDepth + 1) {
			node = this.getParent(d);
		}
		if (node.values) {
			d3.select("#graph").selectAll("path").remove();
			this.nodes = this.partitionLayout
				.nodes(node);
			this.update();
		}

		// this.vis.transition()

		// 	.selectAll("path")
		// 	.attrTween("d", (d) => { return () => { return this.arc(d); }; });
	}
	selectCountry = (e) => {


	}

}
