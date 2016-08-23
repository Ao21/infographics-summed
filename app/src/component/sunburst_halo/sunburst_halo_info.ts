import {Utils} from './../../common/utils';
import * as $ from 'jquery';
export class SunburstHaloInfo {
	constructor() { }
	setTitle(title) {
		$('.title').text(title);
	}

	setPrice(price) {
		$('#AMOUNT').text('$' + Utils.formatMoney(price, 0));
	}
	setCountryInfo(country: any) {
		
		let itemTitle = country.key ? country.key : country.LEGEND_NAME;
		if (country.depth == 3) {
			var percentage = Math.round(country.value / country.parent.value * 100);
			var percentage2 = Math.round(country.parent.value / country.parent.parent.value * 100);
			$('.legend_depth_1 .legend--item--percentage').text(percentage + '%');
			$('.legend_depth_0 .legend--item--percentage').text(percentage2+ '%');
		}
		if (country.depth == 2) {
			var percentage = Math.round(country.value / country.parent.value * 100);
			$('.legend_depth_0 .legend--item--percentage').text(percentage + '%');
		}
		$('#LEGEND_NAME').text(itemTitle);
		$('#info').removeClass();
		$('#info').addClass(`graph-depth-${country.depth}`);
		
		let amount = country.AMOUNT ? country.AMOUNT : country.value;
		let category = country.CATEGORY ? country.CATEGORY : country.key;
		if (country.FUNDING_CATEGORY) {
			category = country.FUNDING_CATEGORY;
		}
		let description = country.DESCRIPTION;
		if (!amount) { amount = '' }
		if (!category) { amount = '' }
		if (!description) { description = '' }
		
		$('#AMOUNT').text('$' + Utils.formatMoney(amount, 0));
		$('#CATEGORY').text(category);
		$('#DESCRIPTION').text(description);
		
	}
	
	createAncestors(ancestors) {
		$('.info__item_legend').show();
		if (ancestors[2]) {
			$('.legend_depth_2--name').text(ancestors[2].LEGEND_NAME);
			$('.legend_depth_2--price').text(ancestors[2].value);
			$('.legend_depth_2').show();
		} else {
			$('.legend_depth_2').hide();
		}
		if (ancestors[1]) {
			
			let title = ancestors[1].LEGEND_NAME ? ancestors[1].LEGEND_NAME : ancestors[1].key; 
			$('.legend_depth_1--name').text(title);
			$('.legend_depth_1--price').text(ancestors[1].value);
			$('.legend_depth_1').show();
			
		} else {
			$('.legend_depth_1').hide();
		}
		if (ancestors[0]) {
			
			$('.legend_depth_0--name').text(ancestors[0].key);
			$('.legend_depth_0--price').text(ancestors[0].value);
			$('.legend_depth_0').show();
			
		} else {
			$('.legend_depth_0').hide();
		}
		
		
		
	}
}
