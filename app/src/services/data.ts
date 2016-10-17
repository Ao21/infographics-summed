import * as d3 from 'd3';
import * as Promise from 'bluebird';

export class DataService {
    constructor() {
        console.log('data');
    }

    loadData() {
        return new Promise((res, rej) => {
            var query: any = window['GRAPH_OPTIONS'];

            // if (!query) {
            //     query = { "country": "denmark", "graph": "sunburstProjection", "translations": { "totalContributions": "Totale bidrag til", "unhcr": "Totale bidrag til UNHCR", "contributions": "Sist opdateret", "comprises": "Udgør <span class=\"percentage\"></span> af", "total": "<span>Totale</span> bidrag til <span class=\"country_name\"></span>", "countryName": "Danmark" } }
            // }

            // d3.json('http://localhost:5000/api/infographics', (data) => {
            //     res(data);
            // });
            d3.json('/api/infographics', (data) => {
                res(data);
            });

        });
    }
};
