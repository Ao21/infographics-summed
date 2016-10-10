import { Utils } from './../../common/utils';
import * as $ from 'jquery';
import * as d3 from 'd3';

export class SunburstHaloInfo {
	constructor() {

	}

	reset() {
		this.setCountry('All Countries');
		$('.legend__title h1 span.primary').text('All Countries');
		$('.legend__title h1 span.secondary').text('');
		
		$('.currency_selector').removeClass('isActive');
		$('.currency_selector button').removeClass('active');
		$('.currency_selector button:nth-of-type(1)').addClass('active');
	}

	setTitle(title, category) {
		$('.legend__title h1 span.primary').text(title);
		$('.legend__title h1 span.secondary').text('');
		if (category !== title) {
			$('.legend__title h1 span.secondary').text(`(${category})`);
		}
		this.setCountry(title);
	}

	setPercentage(percentage) {
		$('.percentage').text(percentage + '%');
	}

	setCountry(title, total?) {
		$('.country_name').text(title);
	}

	setAmount(amount, currency?) {
		let cur = currency ? `${currency} ` : 'USD $';
		if (!amount) {
			$('.legend__amount h3').text(cur + Utils.formatMoney('', 0));
		} else {
			$('.legend__amount h3').text(cur + Utils.formatMoney(amount, 0));
		}
	}

	setCountryInfo(country: any, isLocalMode?: boolean) {
		let amount;
		if (isLocalMode) {
			amount = country.localAggregate ? country.localAggregate : country.LOCAL_TOTAL;
		} else {
			amount = country.usdAggregate ? country.usdAggregate : country.USD_TOTAL;
		}

		let category = country.key;
		if (country.depth === 2) {
			var percentage = Math.round(country.value / country.parent.value * 100);
			this.setPercentage(percentage);
		}

		$('.legend_depth_0').show();
		$('#info').removeClass();
		$('#info').addClass(`graph-depth-${country.depth}`);

		if (!amount) { amount = '' };
		if (!category) { amount = '' };

		this.setTitle(country.COUNTRY_NAME, category);
		if (isLocalMode) {
			let currency = country.CURRENCY ? country.CURRENCY : country.parent.CURRENCY;
			this.setAmount(amount, currency);
		} else {
			this.setAmount(amount);
		}



	}

	createAncestors(ancestors) {
		$('.legend__sub-legend').show();
		$('.legend__sub-legend').addClass('isVisible');
		if (ancestors[1]) {
			$('.legend__amount figure').removeClass('isTotal');
			let title = ancestors[1].key;
			let price = ancestors[1].aggregate ? ancestors[1].aggregate : ancestors[1].TOTAL;
			$('.legend-item__details h4').text(title);

		} else {
			$('.legend__amount figure').addClass('isTotal');
			$('.legend__sub-legend').removeClass('isVisible');
			$('.legend__sub-legend').hide();

		}
	}
}
