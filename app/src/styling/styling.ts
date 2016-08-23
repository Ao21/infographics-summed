import * as d3 from 'd3';
import {Colors} from './../common/colours';

export class Styling {
    nodeStrokeScale = d3.scale.linear();
    // backgroundGradient = vizuly.svg.gradient.blend(viz, "#000", "#000");
    selection = d3.select('#graph');
    stroke_colors = ["#FFA000", "#FF5722", "#F57C00", "#FF9800", "#FFEB3B"];
    fill_colors = ["#C50A0A", "#C2185B", "#F57C00", "#FF9800", "#FFEB3B"];
    
    constructor() { }

    setStyles(init: any) {

        // Hide the plot background
        this.selection.selectAll(".vz-plot-background").style("opacity", 0);
        // Style the link paths
        this.selection.selectAll(".vz-halo-link-path")
            .style("fill", (d: any, i: any) => { return '#03A9F4'; })
            .style("fill-opacity", 0.15);

        this.selection.selectAll(".vz-halo-link-node")
            .style("stroke", (d: any, i: any) => {
                return '#03A9F4';
            });

        this.selection.selectAll(".vz-halo-node")
            .style("fill", (d: any, i: any): any => {
                if (d.subCategory !== '' && d.type === 'Total') {
                    return '#03A9F4';
                } else {
                    return '#fff';

                }
            }).style("stroke", (d: any, i: any) => {
                return '#03A9F4';
            }).style("stroke-width", (d: any, i: any) => { return 1 })
            .style("fill-opacity", (d: any, i: any) => {
                if (d.subCategory !== '' && d.type === 'Total') {
                    return 0.75;
                } else {
                    return .95;
                }

            });


        this.selection.selectAll(".vz-halo-arc-slice")
            .style("fill", (d: any, i: any) => { return '#03A9F4'; })
            .style("stroke", (d: any, i: any) => { return '#FAFAFA'; });

        this.selection.selectAll(".vz-halo-arc").style("fill", (d: any, i: any) => { return 'transparent'; });
    }

}