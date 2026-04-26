// Scale calculation utilities

/**
 * Calculate BMI from weight and height
 * @param weight Weight in kilograms
 * @param heightCm Height in centimeters
 * @returns BMI rounded to 1 decimal place
 */
export function calculateBMI(weight: number, heightCm: number): number {
	const heightInMeters = heightCm / 100;
	const bmi = weight / (heightInMeters * heightInMeters);
	return Math.round(bmi * 10) / 10;
}

/**
 * Calculate age at a specific date
 * @param birthDate Birth date in DD.MM.YYYY format
 * @param measureDate Date of measurement (ISO string or Date object)
 * @returns Age in years
 */
export function calculateAge(birthDate: string, measureDate: string | Date): number {
	if (!birthDate) return 0;

	const birth = new Date(birthDate.split('.').reverse().join('-')); // Convert DD.MM.YYYY to YYYY-MM-DD
	const measure = typeof measureDate === 'string' ? new Date(measureDate) : measureDate;

	return Math.floor((measure.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

/**
 * Get environment values for calculations
 * @param env Environment object from platform
 * @returns Object with parsed body size and birth date
 */
export function getScaleEnvironment(env: any) {
	const bodySizeCm = parseFloat(env?.BODY_SIZE_CM || '0');
	const birthDate = env?.BIRTH_DATE || '';

	return { bodySizeCm, birthDate };
}

// Currency conversion utilities

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
