// Utility functions for portfolio component

interface ExchangeRateData {
	currency: string;
	rate: number;
}

/**
 * Helper class for currency conversion using ECB exchange rates
 */
export class ConversionHelper {
	private static readonly ECB_RATES_URL = 'https://www.ecb.int/stats/eurofxref/eurofxref-daily.xml';
	private static exchangeRates: Record<string, number> = {};
	private static ratesFetched = false;

	/**
	 * Fetches the latest exchange rates from ECB if not already cached
	 */
	static async fetchExchangeRates(): Promise<void> {
		if (this.ratesFetched) return;

		try {
			const xmlContent = await this.fetchXmlContent();
			const rates = await this.parseExchangeRates(xmlContent);
			this.storeExchangeRates(rates);
			this.ratesFetched = true;
		} catch (error) {
			console.error('Failed to fetch exchange rates:', error);
			throw new Error(`Unable to fetch currency exchange rates: ${error}`);
		}
	}

	/**
	 * Fetches XML content from ECB endpoint
	 */
	private static async fetchXmlContent(): Promise<string> {
		const response = await fetch(this.ECB_RATES_URL);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		return await response.text();
	}

	/**
	 * Parses exchange rates from XML content
	 */
	private static async parseExchangeRates(xmlContent: string): Promise<ExchangeRateData[]> {
		const isBrowserEnvironment = typeof (globalThis as any).DOMParser !== 'undefined';

		return isBrowserEnvironment ? this.parseBrowserXml(xmlContent) : this.parseNodeXml(xmlContent);
	}

	/**
	 * Parses XML using browser DOMParser
	 */
	private static parseBrowserXml(xmlContent: string): ExchangeRateData[] {
		const doc = new DOMParser().parseFromString(xmlContent, 'application/xml');
		const nodes = Array.from(doc.querySelectorAll('Cube[currency]'));

		return nodes
			.map((node) => ({
				currency: node.getAttribute('currency'),
				rate: node.getAttribute('rate')
			}))
			.filter((item): item is { currency: string; rate: string } => item.currency !== null && item.rate !== null)
			.map((item) => ({
				currency: item.currency.toUpperCase(),
				rate: parseFloat(item.rate)
			}));
	}

	/**
	 * Parses XML using Node.js fast-xml-parser
	 */
	private static async parseNodeXml(xmlContent: string): Promise<ExchangeRateData[]> {
		const { XMLParser } = await import('fast-xml-parser');
		const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
		const result: any = parser.parse(xmlContent);

		const envelope = result['gesmes:Envelope'] ?? result;
		let cubes: any = envelope?.Cube?.Cube?.Cube ?? [];

		// Ensure cubes is an array
		if (!Array.isArray(cubes)) {
			cubes = [cubes];
		}

		return cubes
			.filter((cube: any) => cube?.currency && cube?.rate)
			.map((cube: any) => ({
				currency: cube.currency.toUpperCase(),
				rate: parseFloat(cube.rate)
			}));
	}

	/**
	 * Stores exchange rates in the internal cache
	 */
	private static storeExchangeRates(rates: ExchangeRateData[]): void {
		this.exchangeRates = {};
		rates.forEach(({ currency, rate }) => {
			if (!isNaN(rate) && rate > 0) {
				this.exchangeRates[currency] = rate;
			}
		});
	}

	/**
	 * Converts a value from the specified currency to EUR
	 * @param currency - Source currency code (e.g., 'USD', 'CHF')
	 * @param value - Amount to convert
	 * @returns Promise<number> - Converted value in EUR, rounded to nearest integer
	 */
	static async convertToEuroValue(currency: string, value: number): Promise<number> {
		const normalizedCurrency = currency.toUpperCase();

		// EUR to EUR conversion
		if (normalizedCurrency === 'EUR') {
			return value;
		}

		await this.fetchExchangeRates();

		const exchangeRate = this.exchangeRates[normalizedCurrency];
		if (!exchangeRate) {
			throw new Error(`Exchange rate for ${normalizedCurrency} not available`);
		}

		return Math.round(value / exchangeRate);
	}

	/**
	 * Gets all available currencies
	 */
	static async getAvailableCurrencies(): Promise<string[]> {
		await this.fetchExchangeRates();
		return ['EUR', ...Object.keys(this.exchangeRates)].sort();
	}

	/**
	 * Gets the current exchange rate for a currency relative to EUR
	 */
	static async getExchangeRate(currency: string): Promise<number> {
		const normalizedCurrency = currency.toUpperCase();

		if (normalizedCurrency === 'EUR') {
			return 1;
		}

		await this.fetchExchangeRates();

		const rate = this.exchangeRates[normalizedCurrency];
		if (!rate) {
			throw new Error(`Exchange rate for ${normalizedCurrency} not available`);
		}

		return rate;
	}

	/**
	 * Clears the cached exchange rates (useful for testing or forcing refresh)
	 */
	static clearCache(): void {
		this.exchangeRates = {};
		this.ratesFetched = false;
	}
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
	// Handle ISO format (YYYY-MM-DD)
	if (dateString.includes('-') && dateString.length >= 10) {
		return new Date(dateString);
	}

	// Handle DD.MM.YYYY format (4-digit year)
	if (dateString.includes('.')) {
		const parts = dateString.split('.');
		if (parts.length !== 3) return new Date();

		const day = parseInt(parts[0]);
		const month = parseInt(parts[1]);
		let year = parseInt(parts[2]);

		// If 2-digit year, convert to 20YY
		if (year < 100) {
			year += 2000;
		}

		return new Date(year, month - 1, day);
	}

	// Fallback: try to parse as-is
	return new Date(dateString);
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

	// Calculate average monthly growth from year-over-year growth
	const monthlyGrowth = annualGrowth / 12;

	// Calculate how many months needed to reach target using monthly growth
	const remaining = target - latestTotal;
	const monthsNeeded = Math.ceil(remaining / monthlyGrowth);

	// Calculate target date by adding months
	const targetDate = new Date(latestDate);
	targetDate.setMonth(targetDate.getMonth() + monthsNeeded);

	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	return `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
}
