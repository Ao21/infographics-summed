import * as _ from 'lodash';
import * as recursive from 'lodash-recursive';
import { Utils } from './../../common/utils';

export class SunburstHaloUtils {

	private totalAmount: any;

	constructor() {

	}

	static defs() {
		let scope: any = {};
		scope.id = 'SUNBURST_HALO';
		let w = document.getElementById('graph').offsetWidth;
		scope.size = {
			width: w,
			height: w
		};

		scope.duration = 500;
		scope.padAngle = 1;
		scope.margin = {
			"top": "0%",
			"bottom": "7%",
			"left": "0%",
			"right": "7%"
		};

		scope.size = Utils.size(scope.margin, scope.size.width, scope.size.height);
		scope.radius = Math.min(scope.size.width, scope.size.height) / 2;
		scope.arcThickness = 10;
		return scope;

	}
	static getIds(data) {
		let output = [];
		data.forEach(function (d) {
			if (output.indexOf(d.ID) === -1) {
				output.push(d.ID);
			}
		});
		return output;

	}
	static innerR(radius, d) {
		return radius * Math.sqrt(d.y) / 10;
	}
	static outerR(radius, d, size?) {
		let r = 20;
		if (Utils.getPageSize().width <= 786) {
			console.log('smaller');
			r = 5;
		}
		return radius * Math.sqrt(d.y + d.dy) / 10 - r;
	}
	static getAncestors(node) {
		var path = [];
		var current = node;
		while (current.parent) {
			path.unshift(current);
			current = current.parent;
		}
		return path;
	}

	static getSummedAmountPerCategory(values) {
		_.forEach(values, (category) => {
			let totalsLocal =
				_.reduce(_.filter(category.values, (z: any) => { return z.TYPE === 'Total'; })
					, (sum = 0, z: any) => {
						return sum + Number(z.AMOUNT);
					}, 0);
			let totals =
				_.reduce(_.filter(category.values, (z: any) => { return z.TYPE === 'Total'; })
					, (sum = 0, z: any) => {
						return sum + Number(z.USD_AMOUNT);
					}, 0);
			category.aggregate = totals;
			category.localAggregate = totalsLocal;
		});
	}

	static averageEntryByCategory(agg, localAgg, entries) {
		_.forEach(entries, (entry) => {
			entry.localValue = entry.AMOUNT / localAgg;
			entry.value = entry.USD_AMOUNT / agg;
		});
	}

	static getTotal(data) {
		return _.sum(_.map(data, (e: any) => { return e.TOTAL; }));
	}


	static sumAmounts(data) {
		_.forEach(data, (e) => {
			this.getSummedAmountPerCategory(e.values);
			_.forEach(e.values, (x) => {
				x.values = _.filter(x.values, (z: any) => { return z.TYPE === 'Total'; });
				this.averageEntryByCategory(x.aggregate, x.localAggregate, x.values);
			});
		});
		_.forEach(data, (e) => {
			e.COUNTRY_NAME = e.key;
			let totalCategory = _.reduce(e.values, (sum, o: any) => {
				return sum += Number(o.aggregate);
			}, 0);

			let localTotalCategory = _.reduce(e.values, (sum, o: any) => {
				return sum += Number(o.localAggregate);
			}, 0);

			e.TOTAL = totalCategory;
			e.LOCAL_TOTAL = localTotalCategory;

			_.forEach(e.values, (x) => {
				e.CURRENCY = x.values[0].CURRENCY;
				delete x.values;
				x.COUNTRY_NAME = e.key;
				x.value = x.aggregate / totalCategory;
				x.localValue = x.localAggregate / localTotalCategory;
			});
			e.value = 1;
		});
		console.log(data);
		return data;
	}
}
