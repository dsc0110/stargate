// Shared configuration for the portfolio component
import { Table, ChartLine } from '@lucide/svelte';
import { calculateCurrentValue, calculateYearOverYear, calculateMillionForecast } from './utils.js';

export const PORTFOLIO_CONFIG = {
	// Default active tab
	DEFAULT_TAB: 'table',

	// Metric labels configuration
	METRIC_LABELS: {
		VALUE: 'Value',
		YEAR_OVER_YEAR: 'YoY',
		MILLION_FORECAST: '1M€ by'
	},

	// Static metrics for fallback
	get DEFAULT_METRICS() {
		return [
			{ label: this.METRIC_LABELS.VALUE, value: '0€' },
			{ label: this.METRIC_LABELS.YEAR_OVER_YEAR, value: '+0€' },
			{ label: this.METRIC_LABELS.MILLION_FORECAST, value: 'Unknown' }
		];
	},

	// Tab configuration (no component references needed in runes mode)
	TABS: [
		{ id: 'chart', icon: ChartLine },
		{ id: 'table', icon: Table }
	]
};

/**
 * Generate dynamic metrics based on portfolio data
 */
export function generateMetrics(portfolio: any[]) {
	try {
		return [
			{ label: PORTFOLIO_CONFIG.METRIC_LABELS.VALUE, value: calculateCurrentValue(portfolio) },
			{ label: PORTFOLIO_CONFIG.METRIC_LABELS.YEAR_OVER_YEAR, value: calculateYearOverYear(portfolio) },
			{ label: PORTFOLIO_CONFIG.METRIC_LABELS.MILLION_FORECAST, value: calculateMillionForecast(portfolio) }
		];
	} catch (error) {
		console.error('Error calculating metrics:', error);
		return PORTFOLIO_CONFIG.DEFAULT_METRICS;
	}
}
