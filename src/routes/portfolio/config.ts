// Shared configuration for the portfolio component
import { Table, ChartLine } from '@lucide/svelte';

export const PORTFOLIO_CONFIG = {
	// Default active tab
	DEFAULT_TAB: 'table',

	// Metrics configuration
	METRICS: [
		{ label: 'Value', value: '350.781€' },
		{ label: 'Year over Year', value: '+100k€' },
		{ label: '1M€ by', value: 'Jan 2035' }
	],

	// Tab configuration (no component references needed in runes mode)
	TABS: [
		{ id: 'chart', icon: ChartLine },
		{ id: 'table', icon: Table }
	]
} as const;
