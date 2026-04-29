import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Parser from 'rss-parser';

// Custom parser with proper headers to avoid 403 errors
const requestHeaders = {
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
	Accept: 'application/rss+xml, application/xml, text/xml, */*',
	'Accept-Language': 'en-US,en;q=0.9',
	'Accept-Encoding': 'gzip, deflate, br'
};

const parser = new Parser({
	requestOptions: {
		headers: requestHeaders
	}
});

// Function to safely parse feeds with XML cleaning for problematic sources
async function parseRSSFeed(url: string): Promise<any> {
	try {
		// Try direct parsing first
		return await parser.parseURL(url);
	} catch (error) {
		// If direct parsing fails, try manual fetch with cleaning
		console.log(`Direct parsing failed for ${url}, trying manual fetch...`);

		const response = await fetch(url, {
			headers: requestHeaders
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		let xmlContent = await response.text();

		// Clean common XML issues
		xmlContent = xmlContent.replace(/^\uFEFF/, ''); // Remove UTF-8 BOM
		xmlContent = xmlContent.replace(/^[^\<]*\</, '<'); // Remove any chars before first tag
		xmlContent = xmlContent.trim();

		// Parse the cleaned content
		return await parser.parseString(xmlContent);
	}
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Define available feed URLs
		const availableFeeds = [
			{ name: 'Reddit', url: 'https://www.reddit.com/.rss' },
			{ name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml' }
		];

		// Get selected feeds from query params
		const selectedFeeds = url.searchParams.get('feeds');
		let feedsToFetch = [];

		if (selectedFeeds && selectedFeeds.trim() !== '') {
			const selectedNames = selectedFeeds
				.split(',')
				.map((name) => name.trim())
				.filter(Boolean);
			feedsToFetch = availableFeeds.filter((feed) => selectedNames.includes(feed.name));
		}

		// Only fetch if there are feeds to fetch
		let results = [];
		if (feedsToFetch.length > 0) {
			// Fetch selected feeds concurrently
			const feedPromises = feedsToFetch.map(async ({ name, url }) => {
				try {
					const feed = await parseRSSFeed(url);
					return {
						name,
						success: true,
						title: feed.title,
						description: feed.description,
						items: feed.items.map((item: any) => ({
							title: item.title,
							link: item.link,
							pubDate: item.pubDate,
							contentSnippet: item.contentSnippet
						}))
					};
				} catch (error) {
					console.error(`Error parsing ${name} feed:`, error);
					return {
						name,
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error occurred'
					};
				}
			});

			results = await Promise.all(feedPromises);
		}

		// Return processed feed data with available feeds list
		return json({
			success: true,
			feeds: results,
			availableFeeds: availableFeeds.map((f) => f.name)
		});
	} catch (error) {
		console.error('RSS parsing error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			},
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const { a, b } = (await request.json()) as { a: number; b: number };
	return json(a + b);
};
