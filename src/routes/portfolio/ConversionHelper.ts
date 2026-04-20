export class ConversionHelper {
    private static exchangeRates: Record<string, number> = {};
    private static ratesFetched = false;

    static async fetchExchangeRates(): Promise<void> {
        if (this.ratesFetched) return;
        const url = 'https://www.ecb.int/stats/eurofxref/eurofxref-daily.xml';
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch exchange rates: ${response.status}`);
        const xml = await response.text();

        if (typeof (globalThis as any).DOMParser !== 'undefined') {
            const doc = new DOMParser().parseFromString(xml, 'application/xml');
            const nodes = Array.from(doc.querySelectorAll('Cube[currency]'));
            nodes.forEach((node) => {
                const currency = node.getAttribute('currency');
                const rate = node.getAttribute('rate');
                if (currency && rate) {
                    this.exchangeRates[currency.toUpperCase()] = parseFloat(rate);
                }
            });
        } else {
            // Node environment fallback using fast-xml-parser
            const { XMLParser } = await import('fast-xml-parser');
            const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
            const result: any = parser.parse(xml);
            const envelope = result['gesmes:Envelope'] ?? result;
            let cubes: any = envelope?.Cube?.Cube?.Cube ?? [];
            if (!Array.isArray(cubes)) cubes = [cubes];
            cubes.forEach((cube: any) => {
                const currency = cube?.currency;
                const rate = cube?.rate;
                if (currency && rate) {
                    this.exchangeRates[currency.toUpperCase()] = parseFloat(rate);
                }
            });
        }

        this.ratesFetched = true;
    }

    static async convertToEuroValue(currency: string, value: number): Promise<number> {
        currency = currency.toUpperCase();
        if (currency === 'EUR') return value;
        await this.fetchExchangeRates();
        const rate = this.exchangeRates[currency];
        if (!rate) throw new Error(`Exchange rate for ${currency} not found.`);
        return Math.round(value / rate);
    }
}
