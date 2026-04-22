// Shared configuration for the portfolio component
import { Table, ChartLine } from '@lucide/svelte';
import { calculateCurrentValue, calculateYearOverYear, calculateMillionForecast } from './utils.js';

export const PORTFOLIO_CONFIG = {
	// Default active tab
	DEFAULT_TAB: 'table',

	// Static metrics for fallback
	DEFAULT_METRICS: [
		{ label: 'Value', value: '0€' },
		{ label: 'Year over Year', value: '+0€' },
		{ label: '1M€ by', value: 'Unknown' }
	],

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
			{ label: 'Value', value: calculateCurrentValue(portfolio) },
			{ label: 'Year over Year', value: calculateYearOverYear(portfolio) },
			{ label: '1M€ by', value: calculateMillionForecast(portfolio) }
		];
	} catch (error) {
		console.error('Error calculating metrics:', error);
		return PORTFOLIO_CONFIG.DEFAULT_METRICS;
	}
}
