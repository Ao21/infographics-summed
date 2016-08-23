import * as d3 from 'd3';
import * as _ from 'lodash';
import {Utils} from './../common/utils';

export class Halo {
    scope: any = {};
    size: any;
    radian: number = Math.PI / 180;
    innerRadius: number;
    outerRadius: number;

    haloArc = d3.svg.arc();
    haloArcs: any;
    subHaloArcs: any;

    haloLayout = d3.layout.pie();
    haloSliceLayout = d3.layout.pie();


    nodes: any;
    nodeHash: any;
    clusters: any;
    clustersHash: any = [];
    nodeData: any;

    nodeLayout = d3.layout.pack();
    linkLayout = d3.svg.diagonal.radial();

    childNodes: any[] = [];
    links: any;
    linkHash: any = [];

    svg: any;
    g: any;
    plot: any;
    linkPlot: any;
    nodePlot: any;
    haloPlot: any;
    background: any;
    circle: any;

    constructor() {
        this.scope.id = 'UN_HALO_GRAPH';
        this.scope.size = {
            width: 800,
            height: 600
        }
        this.scope.duration = 500;
        this.scope.padAngle = 1;
        this.scope.margin = {
            "top": "10%",
            "bottom": "7%",
            "left": "9%",
            "right": "7%"
        }
        this.scope.haloThickness = 0.05;

        this.scope.value = (d: any) => { return Number(d.AMOUNT) }
        this.scope.haloKey = (d: any) => { return d.CATEGORY };
        this.scope.type = (d: any) => { return d.TYPE };
        this.scope.nodeKey = (d: any) => { return d.ID; };
        this.scope.nodeGroupKey = (d: any) => { return d.CATEGORY }
        this.scope.subCategory = (d: any) => { return d.FUNDING_CATEGORY }

    }

    init(data: any) {
        this.scope.data = data;

        this.prepData();
        this.svg = d3.select('#graph').append("svg").attr('id', this.scope.id).style("overflow", "visible").attr("class", "vizuly");;
        this.background = this.svg.append("rect").attr("class", "vz-background");
        this.g = this.svg.append("g").attr("class", "vz-halo-viz");
        this.plot = this.g.append("g").attr("class", "vz-halo-plot").attr("clip-path", "url(#" + this.scope.id + "_plotClipPath)");
        this.linkPlot = this.plot.append("g").attr("class", "vz-halo-link-plot");
        this.nodePlot = this.plot.append("g").attr("class", "vz-halo-node-plot");
        this.haloPlot = this.plot.append("g").attr("class", "vz-halo-arc-plot");

        this.update();


    }

    measure() {
        this.size = Utils.size(this.scope.margin, this.scope.size.width, this.scope.size.height);
        this.outerRadius = Math.min(this.size.width, this.size.height) / 2;
        this.innerRadius = this.outerRadius * (1 - this.scope.haloThickness);

        this.nodeLayout.size([this.innerRadius * 2 * .85, this.innerRadius * 2 * .85])
            .padding(10)
            .sort((null))
            .value(function (d) { return d.value; })
            .children(function (d) { return d.children; });

        this.haloLayout.padAngle(this.scope.padAngle * this.radian)
            .startAngle(0)
            .endAngle(360 * this.radian)
            .value(function (d: any) {
                // If the section contains allocations lower the sum
                let sum = 0;
                _.forEach(d.values, (d) => {
                    if (d.TYPE === 'Total') {
                        sum += Number(d.AMOUNT);
                    } else {
                        //sum -= Number(d.AMOUNT);
                    }
                })
                return sum;
            });

        this.haloSliceLayout.value(this.scope.value).padAngle(0);
        this.haloArc.outerRadius(this.outerRadius).innerRadius(this.innerRadius);

        this.nodeData = this.nodeLayout.nodes({ children: this.clusters }).filter(function (d) { return (d.depth > 1) });


    }

    update() {
        this.measure();

        this.svg.attr("width", this.scope.width).attr("height", this.scope.height);
        this.background.attr("width", this.scope.width).attr("height", this.scope.height);
        this.plot.style("width", this.size.width).style("height", this.size.height).attr("transform", "translate(" + this.size.left + "," + this.size.top + ")");
        this.haloPlot.attr("transform", "translate(" + this.size.width / 2 + "," + this.size.height / 2 + ")");
        this.linkPlot.attr("transform", "translate(" + this.size.width / 2 + "," + this.size.height / 2 + ")");
        this.nodePlot.attr("transform", "translate(" + (this.size.width - this.innerRadius * 2 * .85) / 2 + "," + (this.size.height - this.innerRadius * 2 * .85) / 2 + ")");

        var haloGroup = this.haloPlot.selectAll(".vz-halo-arc").data(this.haloLayout(this.haloArcs));
        haloGroup.enter().append("path")
            .attr("class", function (d: any) { return "vz-halo-arc " + "halo-key_" + d.data.key })
            .on("mouseover", function (d: any, i: any) { })
            .on("mouseout", function (d: any, i: any) { })
        haloGroup.exit().remove();
        haloGroup.attr("d", (d: any, i: any) => {
            return this.haloArc(d, i);
        });

        haloGroup.each((haloSection: any) => {
            var angle = (haloSection.startAngle + (haloSection.endAngle - haloSection.startAngle) / 2) - 90 * this.radian;
            haloSection.x = this.innerRadius * Math.cos(angle);
            haloSection.y = this.innerRadius * Math.sin(angle);
        });

        this.links = this.linkPlot.selectAll(".vz-halo-group").data(this.haloLayout(this.haloArcs));
        this.links.enter().append("g").attr("class", "vz-halo-group");
        this.links.exit().remove();
        

        this.links.each((arcGroup: any, i: any) => {
            let pAngle: any = this.haloLayout.padAngle();
            this.haloSliceLayout.startAngle(arcGroup.startAngle + pAngle / 1.415).endAngle(arcGroup.endAngle - pAngle / 1.415);

            var link = d3.select(this.links[0][i])
                .selectAll(".vz-halo-link")
                .data(this.haloSliceLayout(arcGroup.data.values));
            link.enter().append("g").attr("class", "vz-halo-link");
            link.exit().remove();

            link.selectAll("path").remove();
            link.selectAll("circle").remove();

            link.append("path").attr("class", (d: any) => {
                return "vz-halo-arc-slice node-key_" + this.scope.nodeKey(d.data) + " type_" + this.scope.type(d.data);
            }).attr("d", this.haloArc);

            var t = 0;
            link.each((arc: any, x: any) => {
                var linkPath = this.createLinkPath(arc);

                // Add a circle node with a radius showing the relative link value to all links for that node.
                var node = this.nodeHash[this.scope.nodeKey(arc.data)];

                //Adding our link path for each slice of the arc
                var arcSlice = d3.select(link[0][x]);
                arcSlice.append("path").attr("class",
                    "vz-halo-link-path node-key_" + this.scope.nodeKey(arc.data) + " halo-key_" + this.scope.haloKey(arc.data))
                    .on("mouseover", function (d: any, i: any) { })
                    .on("mouseout", function (d: any, i: any) { })
                    .attr("d", (d: any, i: any) => {
                        //This takes two line paths, connects them and creates an arc at the end
                        var diag = this.linkLayout(linkPath.arc_to_node, i);
                        diag += "L" + String(this.linkLayout(linkPath.node_to_arc, i)).substr(1);
                        diag += "A" + (this.innerRadius) + "," + (this.innerRadius) + " 0 0,0 " + linkPath.arc_to_node.source.x + "," + linkPath.arc_to_node.source.y;
                        return diag;
                    });
                this.linkHash.push(arc);

            });

            this.circle = this.nodePlot.selectAll(".vz-halo-node").data(this.nodeData);
            this.circle.enter().append("circle").attr("class", function (d: any) { return "vz-halo-node node-key_" + d.key; })
                .on("mouseover", function (d: any, i: any) { })
                .on("mouseout", function (d: any, i: any) { });
            this.circle.exit().remove();
            this.circle.attr("r", 0)
                .attr("cx", function (d: any) { return d.x })
                .attr("cy", function (d: any) { return d.y })
                .transition().duration(this.scope.duration).attr("r", function (d: any) { return d.r; });
        })
        // var force = d3.layout.force()
        //     .nodes(this.nodeData)
        //     .size([this.size.width, this.size.height])
        //     .gravity(0)
        //     .charge(10)
        //     .on("tick", this.tick)
        //     .start()

        // var force = d3.layout.force()
        //     .nodes(this.linkHash)
        //     .gravity(0)
        //     .charge(10)
        //     .on("tick", this.tickLinks)
        //     .start()        
        // var force2 = d3.layout.force()
        //     .nodes(this.childNodes)

        //     .on("tick", this.tick)
        // .start();


    }

    cluster = (alpha) => {
        return (d) => {
            var cluster = this.clustersHash[d.nodeGroup];
            //if (cluster.id === d.nodeGroup && d.subCategory !== '' && d.type ==='Total') return;
            var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.r + cluster.r;
            if (l != r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                cluster.x += x;
                cluster.y += y;
            }
        };
    }
 
    tick = (e) => {
       // this.circle.each(this.cluster(10 * e.alpha * e.alpha)).each(this.collide(0.5)).attr("cx", (d) => { return d.x; }).attr("cy", (d) => { return d.y; });
    }

    collide = (alpha) => {
        var quadtree = d3.geom.quadtree(this.clusters);
        return (d) => {
            var cluster = this.clustersHash[d.nodeGroup];
            //if (cluster.id === d.nodeGroup && d.subCategory && d.type ==='Total') return;
            var r = d.r + 20 + Math.max(25, 25),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function (quad: any, x1, y1, x2, y2) {
                if (quad.point && (quad.point.value !== d.value)) {

                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.r + quad.point.r + (d.cluster === quad.point.cluster ? 26 : 25);
                    if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }




    createLinkPath(arcSlice: any) {
        var node = this.nodeHash[this.scope.nodeKey(arcSlice.data)];
        console.log(node);
        var link: any = {};
        link.data = arcSlice.data;

        var o: any = {}; //Create the link from the start angle of the arc slice to the node
        o.source = {};
        o.source.x = this.innerRadius * Math.cos(arcSlice.startAngle - 1.57079633) //-(90 degrees)
        o.source.y = this.innerRadius * Math.sin(arcSlice.startAngle - 1.57079633);
        o.target = {};
        o.target.x = node.x - this.innerRadius * .85;
        o.target.y = node.y - this.innerRadius * .85;

        var p: any = {}; //Create a reverse link from node back to the end angle of the arc slice;
        p.target = {};
        p.target.x = this.innerRadius * Math.cos(arcSlice.endAngle - 1.57079633) //-(90 degrees)
        p.target.y = this.innerRadius * Math.sin(arcSlice.endAngle - 1.57079633);
        p.source = o.target;

        link.arc_to_node = o;
        link.node_to_arc = p;

        return link;
    }


    prepData() {
        this.haloArcs = d3.nest().key(this.scope.haloKey).entries(this.scope.data).filter(
            (e: any) => { return e; }
        );
        this.nodes = d3.nest().key(this.scope.nodeKey).entries(this.scope.data);

        let clusterKeys = d3.nest().key((e: any) => { return e.CATEGORY }).key((e: any) => { return e.FUNDING_CATEGORY }).entries(this.scope.data);

        this.nodeHash = [];
        this.nodes.forEach((d: any) => {
            d.subCategory = this.scope.subCategory(d.values[0]);
            d.type = this.scope.type(d.values[0]);
            d.nodeGroup = this.scope.nodeGroupKey(d.values[0]);
            this.nodeHash[this.scope.nodeKey(d.values[0])] = d;
        });

        this.sumGroup(this.haloArcs);
        this.sumGroup(this.nodes);

        this.clusters = [];
        clusterKeys.forEach((d) => {
            var o: any = {};
            o.id = d.key;
            o.values = this.nodes.filter(function (n: any) { return (d.key == n.nodeGroup) });
            o.children = o.values;
            _.forEach(o.children, (x) => {
                this.sumValues(x);
            })
            if (_.find(o.values, (e: any) => { return e.subCategory !== '' })) {
                o.children = this.nodes.filter(function (n: any) { return (d.key == n.nodeGroup) && n.type === 'Total' });
                o.values = o.children;
                _.forEach(o.children, (e) => {
                    e.cluster = true;
                    e.children = this.nodes.filter(function (n: any) { return (d.key == n.nodeGroup) && e.subCategory === n.subCategory && n.type !== 'Total' });
                    _.forEach(e.children, (x) => {
                        this.childNodes.push(x)
                        this.sumValues(x);
                    })
                });
            }

            this.clusters.push(o);


        });
        this.clusters.forEach((d: any) => {
            this.clustersHash[d.id] = d;
        });

    }

    sumGroup(group, key?) {
        group.forEach((d) => {
            var sum = 0;
            d.values.forEach((o) => {
                if (key) {
                    sum += Number(o[key]);
                }
                else {
                    sum += Number(this.scope.value(o));
                }
            });
            d.value = sum;
        });
    }

    sumValues(group: any) {
        let sum = 0;
        _.forEach(group.values, (e) => {
            sum += e.AMOUNT;
        })
        group.value = sum;
    }

    filterChildren(nodes: any) {

    }


}