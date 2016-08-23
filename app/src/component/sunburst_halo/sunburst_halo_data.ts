import * as _ from 'lodash';
import * as recursive from 'lodash-recursive';
import {Utils} from './../../common/utils';

export class SunburstHaloUtils {

	constructor() {

	}

    static defs() {
        let scope: any = {};
        scope.id = 'SUNBURST_HALO';
        scope.size = {
            width: 600,
            height: 600
        };

        scope.duration = 500;
        scope.padAngle = 1;
        scope.margin = {
            "top": "0%",
            "bottom": "7%",
            "left": "0%",
            "right": "7%"
        }
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
	static outerR(radius, d) {

		return radius * Math.sqrt(d.y + d.dy) / 10 - 20;
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

	static addHiddenChildTotals(values) {
		let childValues = values;
		// Add the Totals Together
		let childEntryTotalAgg =
			_.reduce(_.filter(childValues, (z: any) => { return z.TYPE === 'Total'; })
				, (sum = 0, z: any) => {
					return sum + Number(z.AMOUNT);
				}, 0);
		// Get the Sub Category child entires
		values = _.filter(childValues, (z: any) => { return z.TYPE !== 'Total'; });
		if (values.length == 0) {
			// No Deducated Entries
			values = childValues;
		} else {
			// Get the SubCategory child entry Values that aren't totals
			let subValueTotals = _.reduce(_.filter(childValues, (z: any) => { return z.TYPE != 'Total'; })
				, (sum = 0, z: any) => {
					return sum + Number(z.AMOUNT);
				}, 0);
			// If The Subcategory Entry Values dont add up to the Subcategory Total Value
			// Insert a hidden arc on the circle
			if (subValueTotals !== childEntryTotalAgg) {
				values.push({
					AMOUNT: childEntryTotalAgg - subValueTotals,
					CATEGORY: "Flexible Earmark",
					FUNDING_CATEGORY: "Emergency Reserve",
					TYPE: 'Hidden'
				})
			}
		}
		return values;
	}
	static hasChildren(node) {
		let children = _.find(node.values, e => {
			return e['values'];
		})
		return children ? true : false;
	}
    static sumAmounts(data) {
		_.forEach(data, (e) => {
			let obj = {};
			_.forEach(e.values, (x) => {
				if (x.key) {

					// Add the Hidden Child Value Totals
					x.values = this.addHiddenChildTotals(x.values);
					// Set the Sub Category to the same category as its child entries
					x.CATEGORY = e.key + ': ' + x.values[0].FUNDING_CATEGORY;
				} else {
					
				}
			});

			if (!this.hasChildren(e)) {
				console.log(e);
				e.values = this.addHiddenChildTotals(e.values);
			}
			
			// e.value = _.reduce(e.values, (sum, o: any) => {
			// 	return sum += Number(o.AMOUNT) ? Number(o.AMOUNT) : Number(o.value);
			// }, 0);

		});
		recursive.map(data, (node, recursive, map) => {
			if (node.values) {
				recursive(node.values);
			}
			return map(node);
		}, (node) => {
			if (node.USD_AMOUNT) {
				node.value = Number(node.USD_AMOUNT);
			}
			if (!node.key) {
				node.key = node.LEGEND_NAME;
			}
			return node;
		});
		return data;
	}
}