// Utility functions for portfolio component
import { SHARED_STYLES } from './styles.js';

/**
 * Get button classes based on active state
 */
export function getButtonClasses(isActive: boolean): string {
	return `${SHARED_STYLES.buttonBase} ${isActive ? SHARED_STYLES.buttonActive : SHARED_STYLES.buttonInactive}`;
}

/**
 * Validate tab ID exists in configuration
 */
export function isValidTabId(tabs: any[], tabId: string): boolean {
	return tabs.some((tab) => tab.id === tabId);
}

/**
 * Calculate the total value of a portfolio entry
 */
export function calculatePortfolioTotal(entry: any): number {
	return entry.accounts.dkbCash + entry.accounts.dkbDepot + entry.accounts.zkbCash;
}

/**
 * Parse portfolio date string to Date object
 */
function parsePortfolioDate(dateString: string): Date {
	// Convert DD.MM.YY to MM/DD/YYYY format for Date parsing
	const parts = dateString.split('.');
	if (parts.length !== 3) return new Date();

	const day = parseInt(parts[0]);
	const month = parseInt(parts[1]);
	const year = parseInt(parts[2]) + 2000; // Assuming YY format is 20YY

	return new Date(year, month - 1, day);
}

/**
 * Calculate current portfolio value
 */
export function calculateCurrentValue(portfolio: any[]): string {
	if (!portfolio || portfolio.length === 0) return '0€';

	const latest = portfolio[0]; // Portfolio is sorted newest-first
	const total = calculatePortfolioTotal(latest);

	return `${total.toLocaleString('de-DE', { maximumFractionDigits: 0 })}€`;
}

/**
 * Calculate year over year growth
 */
export function calculateYearOverYear(portfolio: any[]): string {
	if (!portfolio || portfolio.length < 2) return '+0€';

	const latest = portfolio[0];
	const latestTotal = calculatePortfolioTotal(latest);
	const latestDate = parsePortfolioDate(latest.date);

	// Find entry closest to being 1 year older than the newest
	const oneYearAgo = new Date(latestDate);
	oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

	let baseEntry = portfolio[portfolio.length - 1]; // Default to oldest
	let closestDiff = Infinity;

	// Find the entry closest to exactly 1 year before the latest date
	for (const entry of portfolio) {
		const entryDate = parsePortfolioDate(entry.date);
		const timeDiff = Math.abs(entryDate.getTime() - oneYearAgo.getTime());

		// Only consider entries that are older than or equal to 1 year ago
		if (entryDate <= oneYearAgo && timeDiff < closestDiff) {
			closestDiff = timeDiff;
			baseEntry = entry;
		}
	}

	const oldTotal = calculatePortfolioTotal(baseEntry);
	const growth = latestTotal - oldTotal;
	const sign = growth >= 0 ? '+' : '';

	return `${sign}${growth.toLocaleString('de-DE', { maximumFractionDigits: 0 })}€`;
}

/**
 * Calculate forecast for reaching 1 million
 */
export function calculateMillionForecast(portfolio: any[]): string {
	if (!portfolio || portfolio.length < 2) return 'Unknown';

	const target = 1000000;
	const latest = portfolio[0];
	const latestTotal = calculatePortfolioTotal(latest);

	// If already at or above target
	if (latestTotal >= target) return 'Achieved!';

	const latestDate = parsePortfolioDate(latest.date);

	// Find entry closest to being 1 year older than the newest
	const oneYearAgo = new Date(latestDate);
	oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

	let baseEntry = portfolio[portfolio.length - 1]; // Default to oldest
	let closestDiff = Infinity;

	// Find the entry closest to exactly 1 year before the latest date
	for (const entry of portfolio) {
		const entryDate = parsePortfolioDate(entry.date);
		const timeDiff = Math.abs(entryDate.getTime() - oneYearAgo.getTime());

		// Only consider entries that are older than or equal to 1 year ago
		if (entryDate <= oneYearAgo && timeDiff < closestDiff) {
			closestDiff = timeDiff;
			baseEntry = entry;
		}
	}

	const oldTotal = calculatePortfolioTotal(baseEntry);
	const annualGrowth = latestTotal - oldTotal;

	// If no growth or negative growth
	if (annualGrowth <= 0) return 'No growth';

	// Calculate years needed
	const remaining = target - latestTotal;
	const yearsNeeded = remaining / annualGrowth;

	// Calculate target date
	const targetDate = new Date(latestDate);
	targetDate.setFullYear(targetDate.getFullYear() + Math.ceil(yearsNeeded));

	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	return `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
}
