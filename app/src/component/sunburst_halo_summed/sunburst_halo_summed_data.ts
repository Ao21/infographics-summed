import * as _ from 'lodash';
import * as recursive from 'lodash-recursive';
import { Utils } from './../../common/utils';

let entryId = 0;

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

	static getSummedAmountPerCategory(values, localMode?) {
		_.forEach(values, (category) => {
			let totalsLocal =
				_.reduce(_.filter(category.values, (z: any) => { return z.TYPE === 'Total'; })
					, (sum = 0, z: any) => {
						return sum + Number(z.AMOUNT);
					}, 0);
			let totalsUSD =
				_.reduce(_.filter(category.values, (z: any) => { return z.TYPE === 'Total'; })
					, (sum = 0, z: any) => {
						return sum + Number(z.USD_AMOUNT);
					}, 0);
			
			category.usdAggregate = totalsUSD;
			category.localAggregate = totalsLocal;

			if(!localMode) {
				category.aggregate = totalsUSD;
			} else {
				category.aggregate = totalsLocal;
			}
			
		});
	}

	static averageEntryByCategory(agg, localAgg, usdAgg, entries, localMode?) {
		_.forEach(entries, (entry) => {
			entry.categoryInfo = entry.CATEGORY_REF;
			entry.countryInfo = entry.COUNTRY_ID;
			entry.localValue = entry.AMOUNT / localAgg;
			entry.usdValue = entry.USD_AMOUNT / usdAgg;

			if (!localMode) {
				entry.value = entry.usdValue
			} else {
				entry.value = entry.localValue;
			}
			
		});
	}

	static getTotal(data) {
		return _.sum(_.map(data, (e: any) => { return e.TOTAL; }));
	}


	static sumAmounts(data, localMode?) {
		entryId = 0;
		_.forEach(data, (e) => {
			this.getSummedAmountPerCategory(e.values, localMode);
			_.forEach(e.values, (x) => {
				x.values = _.filter(x.values, (z: any) => { return z.TYPE === 'Total'; });
				this.averageEntryByCategory(x.aggregate, x.localAggregate, x.usdAggregate ,x.values, localMode);
			});
		});
		_.forEach(data, (e) => {
			e.COUNTRY_NAME = e.key;
			e.id = entryId++;
			let localTotalCategory = _.reduce(e.values, (sum, o: any) => {
				return sum += Number(o.localAggregate);
			}, 0);

			let usdTotalCategory = _.reduce(e.values, (sum, o: any) => {
				return sum += Number(o.usdAggregate);
			}, 0);

			e.LOCAL_TOTAL = localTotalCategory;
			e.USD_TOTAL = usdTotalCategory;
			if (!localMode) {
				e.TOTAL = e.USD_TOTAL;
			} else {
				e.TOTAL = e.LOCAL_TOTAL;
			}

			_.forEach(e.values, (x) => {
				x.id = entryId++;
				x.CATEGORY = x.values[0].CATEGORY_REF;
				e.CURRENCY = x.values[0].CURRENCY;
				e.COUNTRY = x.values[0].COUNTRY_ID;
				x.COUNTRY = x.values[0].COUNTRY_ID;
				delete x.values;
				x.COUNTRY_NAME = e.key;
				x.usdValue = x.usdAggregate / usdTotalCategory;
				x.localValue = x.localAggregate / localTotalCategory;
				if (!localMode) {
					x.value = x.usdValue;
				} else {
					x.value = x.localValue;
				}
				
			});
			e.value = 1;
		});
		console.log(data);
		return data;
	}
}
