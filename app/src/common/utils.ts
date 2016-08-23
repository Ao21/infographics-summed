import * as _ from 'lodash';
import * as recursive from 'lodash-recursive';

export class Utils {
    static getPageSize() {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;
        return ({ width: x, height: y });
    }
    static formatMoney(n, c, d?, t?) {
        var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i: any = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    }

    static unNester(data): any {
        let obj = {};
        recursive.map(data, function (node, recursive, map) {
            if (node.values && node.values[0].key !== '') {
                recursive(node.values);
            } else if (node.values && node.values[0].key === '') {
                node.values = node.values[0].values;
            }
            return map(node);
        }, (node) => {
            return node;
        });
        return data;

    }
    static measure(m0: any, m1: any) {
        if (typeof m0 == "string" && m0.substr(m0.length - 1) == "%") {
            var r = Math.min(Number(m0.substr(0, m0.length - 1)), 100) / 100;
            return (Math.round(m1 * r));
        } else { return m0; };
    }
    static size(margin: any, width: any, height: any) {
        let size: any = {};

        size.width = width - this.measure(margin.left, width) - this.measure(margin.right, width);
        size.height = height - this.measure(margin.top, height) - this.measure(margin.bottom, height);
        size.top = this.measure(margin.top, height);
        size.left = this.measure(margin.left, width);

        return size;
    }

    static convertValuesToChildren(root, value_key) {
        for (var key in root) {
            if (key === "key") {
                root.name = root.key;
                delete root.key;
            }
            if (key === "values") {
                root.children = [];
                for (let item in root.values) {
                    root.children.push(this.convertValuesToChildren(root.values[item], value_key));
                }
                delete root.values;
            }
            if (key === value_key) {
                root.value = parseFloat(root[value_key]);
                delete root[value_key];
            }
        }
        return root;

    }
}