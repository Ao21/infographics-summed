import * as d3 from 'd3';
import * as Promise from 'bluebird';

export class DataService {
    constructor() {
        console.log('data');
    }

    loadData() {
        return new Promise((res, rej) => {
            var query: any = window['GRAPH_OPTIONS'];

            if (!query) {
                query = {
                    year: 2015,
                    country: 'sweden',
                    graph: 'chart'
                };
            }
            d3.json('http://localhost:5000/api/infographics', (data) => {
                res(data);
            });
            // d3.json('/api/infographics', (data) => {
            //     res(data);
            // });

        });
    }
};
