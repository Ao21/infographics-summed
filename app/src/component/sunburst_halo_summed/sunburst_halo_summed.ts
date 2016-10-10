import * as d3 from 'd3';
import * as _ from 'lodash';
import * as $ from 'jquery';

import { Subject } from 'rxjs/Rx';

import { Utils } from './../../common/utils';
import { Colors } from './../../common/colours';
import { SunburstHaloUtils } from './sunburst_halo_summed_data';
import { WorldProjection } from './../projection/projection';
import { SunburstHaloInfo } from './sunburst_halo_summed_info';
import * as recursive from 'lodash-recursive';

export class SunburstHaloSummed {
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

	totalAmount: any;
	localMode: boolean = false;
	lastSelectedCountry: any;

	options = window['GRAPH_OPTIONS'];

	constructor() {

		if(!this.options){
			this.options = { "country": "denmark", "graph": "sunburstProjection", "translations": { "totalContributions": "Totale bidrag til", "unhcr": "Totale bidrag til UNHCR", "contributions": "Sist opdateret", "comprises": "Udgør <span class=\"percentage\"></span> af", "total": "<span>Totale</span> bidrag til <span class=\"country_name\"></span>", "countryName": "testland" } };
		}

		$('.currency_selector button').click((e: any) => {
			$('.currency_selector button').removeClass('active');
			let a = e.target.dataset.type;
			$(e.target).addClass('active');
			if (e.target.dataset.type === 'default') {
				this.localMode = false;
				this.prepData();
				d3.select("#graph").selectAll("path").remove();
				this.nodes = this.partitionLayout
					.nodes(this.arcData);
				this.update();
				if (this.lastSelectedCountry) {
					this.info.setCountryInfo(this.lastSelectedCountry, false);
					this.highlightCountry(this.lastSelectedCountry);
				}
			} else {
				this.localMode = true;
				d3.select("#graph").selectAll("path").remove();
				this.prepData();
				this.nodes = this.partitionLayout
					.nodes(this.arcData);
				this.update();
				this.info.setCountryInfo(this.lastSelectedCountry, true);
				this.highlightCountry(this.lastSelectedCountry);

			}
		});

		this.mouseOver.debounceTime(50).subscribe((next) => {
			this.lastSelectedCountry = next;
			this.info.setCountryInfo(next, this.localMode);
			$('.currency_selector').addClass('isActive');
			this.highlightCountry(next);
			$('.resetButton').show();


		});
	}

	highlightCountry(next) {
		let ancestors = SunburstHaloUtils.getAncestors(next);
		this.info.createAncestors(ancestors);
		this.arcPlot.selectAll("path")
			.style("opacity", 0.3);
		this.arcPlot.selectAll("path")
			.filter(function (node) {
				return (ancestors.indexOf(node) >= 0);
			}).style("opacity", 1);

		this.arcPlot.selectAll("path")
			.filter((node) => {
				return node.id === next.id;

			}).style("opacity", 1)
			.style("fill", (d) => {
				return this.c.darkBlue(100);
			});

		this.worldProjection.transition(next.MAP_COUNTRY ? next.MAP_COUNTRY.split(';') : 'default');
	}

	init(data: any) {
		this.scope = _.extend(this.scope, SunburstHaloUtils.defs());
		this.scope.data = data;
		this.prepData();
		this.vis = d3.select('#graph')
			.append("svg:svg")
			.attr('id', this.scope.id)
			.style("overflow", "visible");

		this.background =
			this.vis.append("rect")
				.attr("class", "vz-background")
				.style("fill", "transparent");
		this.worldPlot = this.vis.append("g").attr("class", "un-world-plot");
		let worldPosition = this.scope.size.width * 0.5;
		let g = this.worldProjection.init(this.worldPlot, worldPosition);

		g.style('position', 'absolute')
			.style('top', this.scope.size.height / 2 - (worldPosition / 2) + 'px')
			.style('left', this.scope.size.width / 2 - (worldPosition / 2) + 'px')
			.style("pointer-events", "none");
		this.g = this.vis.append("g").attr("class", "vz-halo-viz");
		this.plot = this.g.append("g").attr("class", "vz-halo-plot").attr("clip-path", "url(#" + this.scope.id + "_plotClipPath)");

		this.arcPlot = this.plot.append("g").attr("class", "vz-arc-plot");

		this.x = d3.scale.linear().range([0, 2 * Math.PI]);
		this.y = d3.scale.sqrt().range([0, 100]);

		this.measure();
		this.update();
		this.worldProjection.rotate();
		$('.resetButton').click((e) => {
			this.reset();
		});
	}

	prepData(currencyType?: any) {
		let year;
		if (this.options && this.options.hasOwnProperty('year')) {
			year = this.options.year;
		} else {
			year = 2015;
		}
		this.scope.data = _.filter(this.scope.data, (e: any) => { return e.YEAR === year; });
		this.sunburstArcs =
			d3.nest()
				.key((e: any) => { return e.COUNTRY_NAME; })
				.key((e: any) => { return e.CATEGORY; })
				.entries(this.scope.data);

		this.sunburstArcs = Utils.unNester(this.sunburstArcs);

		this.arcData = { name: "root", values: SunburstHaloUtils.sumAmounts(this.sunburstArcs, this.localMode) };

		this.totalAmount = this.info.setAmount(SunburstHaloUtils.getTotal(this.arcData.values));
		this.info.setCountry('All Countries');
		_.each(this.arcData.children, (e) => {
			//console.log(e);
		});
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
			.on("click", this.click)
			.attr("display", function (d) { return d.depth ? null : "none"; })
			.attr("d", this.arc)
			.attr("fill-rule", "evenodd")
			.style("fill", (d) => {
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

	reset = (d?) => {
		this.localMode = false;
		this.prepData();
		d3.select("#graph").selectAll("path").remove();
		this.nodes = this.partitionLayout
			.nodes(this.arcData);
		this.update();
		this.info.reset();
		this.totalAmount = this.info.setAmount(SunburstHaloUtils.getTotal(this.arcData.values));
		$('.resetButton').hide();
		$('.legend__amount figure').addClass('isTotal');
		$('.legend__sub-legend').hide();
		
		this.worldProjection.rotate();
		this.update();

	}

	click = (d) => {}
	selectCountry = (e) => {}

}
