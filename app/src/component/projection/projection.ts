import * as d3 from 'd3';
import * as _ from 'lodash';
import {Utils} from './../../common/utils';
import * as q from 'd3-queue';
import * as topojson from 'topojson';
import * as d3Timer from 'd3-timer';

import {Colors} from './../../common/colours';

let time = Date.now();
var rotate = [0, 0];
var velocity = [.025, -0];
let timer = null;

export class WorldProjection {
    scope: any;
    vis: any;
    g: any;
    plot: any;
    worldMap: any;
    background: any;

    context: any;
    path: any;

    projection: any;

    globe: any;
    land: any;
    countries: any;
    borders: any;

    world: any;
    countriesDict: any = [];

    lastAnimationTarget: any;

    i: number = -1;
    n;

    colors: Colors = new Colors();


    constructor() {
        this.scope = {
            id: 'PROJECTION_MAP'

        };
    }

    init(vis?, size?) {

        this.scope.width = size;
        this.scope.height = size;

        this.vis = d3.select('#graph');
        this.g = this.vis.append("g").attr("class", "un-world-projection");

        this.worldMap = this.g.append("canvas");
        this.measure();
        return this.g;
    }
    measure() {
        this.projection = d3.geo.orthographic()
            .translate([this.scope.width / 2, this.scope.height / 2])
            .clipAngle(90)
            .precision(0.06);

        this.vis
            .attr("width", this.scope.width + 'px')
            .attr("height", this.scope.height + 'px');
        this.worldMap
            .attr("width", this.scope.width + 'px')
            .attr("height", this.scope.height + 'px')
            .style("border-radius", "50%")
            .style("pointer-events", "none");

        this.context = this.worldMap.node().getContext("2d");

        this.path = d3.geo.path()
            .projection(this.projection)
            .context(this.context);

        q.queue()
            .defer(d3.json, '/assets/world-110m.json')
            .defer(d3.tsv, '/assets/world-country-names.tsv')
            .await(this.update);

    }


    update = (err, world, names) => {
        this.globe = { type: "Sphere" };
        this.land = topojson.feature(world, world.objects.land);
        this.world = world;
        this.countries = topojson.feature(world, world.objects.countries).features;
        this.borders = topojson.mesh(world, world.objects.countries, function (a, b) { return a !== b; });
        this.i = 0;
        this.n = this.countries.length;


        this.countries = this.countries.filter(function (d) {
            return names.some(function (n) {
                if (d.id == n.id) return d.name = n.name;
            });
        }).sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });


        _.each(this.countries, (e) => {
            this.countriesDict[e.name] = e;
        })

        // setTimeout(() => {
        //     this.transition(['Denmark', 'Finland', 'Sweden', 'Norway', 'Estonia']);
        // }, 1500);

    }

    rotate = () => {
        if (timer === null) {
            let n = -0.1;
            timer = d3Timer.timer(() => {
                var dt = Date.now() - time;
                if (rotate[1] < -50) {
                    n = 0.1;
                    rotate[1] = -49;
                } else if (rotate[1] > 50) {
                    n = -0.1;
                    rotate[1] = 49;
                }

                rotate[1] = rotate[1] + n;                
                this.projection.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);
                this.updateWorld();
            });
        }

    }

    transition = (countryName) => {
        let country;
        let countries = [];

        if (timer) {
            timer.stop();
            timer = null;
        }

        if (countryName === 'default') {
            countryName = ['Denmark', 'Finland', 'Sweden', 'Norway', 'Estonia'];
        }

        if (_.isString(countryName)) {
            countries.push(this.countriesDict[countryName]);
        }
        if (_.isArray(countryName)) {
            _.each(countryName, (e) => {
                countries.push(this.countriesDict[e]);
            })
        }

        topojson.mergeArcs;
        d3.transition()
            .duration(700)
            .tween("rotate", () => {
                var p = d3.geo.centroid(countries[0]),
                    r = d3.interpolate(this.projection.rotate(), [-p[0], -p[1]]);
                return (t) => {

                    this.projection.rotate(r(t));
                    this.context.clearRect(0, 0, this.scope.width, this.scope.height);
                    this.context.fillStyle = "#ccc",
                        this.context.beginPath(),
                        this.path(this.land),
                        this.context.fill();

                    _.each(countries, (e) => {
                        this.context.fillStyle =
                            this.colors.blue(),
                            this.context.beginPath(),
                            this.path(e),
                            this.context.fill();
                    })
                    this.context.strokeStyle = "#fff", this.context.lineWidth = .5, this.context.beginPath(), this.path(this.borders), this.context.stroke();
                    this.context.strokeStyle = "#000", this.context.lineWidth = 2, this.context.beginPath(), this.path(this.globe), this.context.stroke();
                };
            })
            .transition()

    }

    updateWorld() {
        this.context.clearRect(0, 0, this.scope.width, this.scope.height);
                    this.context.fillStyle = "#ccc",
                        this.context.beginPath(),
                        this.path(this.land),
                        this.context.fill();

                    // _.each(countries, (e) => {
                    //     this.context.fillStyle =
                    //         this.colors.blue(),
                    //         this.context.beginPath(),
                    //         this.path(e),
                    //         this.context.fill();
                    // })
                    this.context.strokeStyle = "#fff", this.context.lineWidth = .5, this.context.beginPath(), this.path(this.borders), this.context.stroke();
                    this.context.strokeStyle = "#000", this.context.lineWidth = 2, this.context.beginPath(), this.path(this.globe), this.context.stroke();
    }

}