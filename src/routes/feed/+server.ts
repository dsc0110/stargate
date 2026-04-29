import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Parser from 'rss-parser';
import type { FeedData, FeedConfig } from './types';

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
		// Define available feed URLs with categories
		const availableFeeds: FeedConfig[] = [
			{ name: 'Tagesschau', url: 'https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml', category: 'News' },
			{ name: 'SRF', url: 'https://www.srf.ch/news/bnf/rss/19032223', category: 'News' },
			{ name: 'BBC', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'News' },
			{ name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'Tech' },
			{ name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech' },
			{ name: 'Cloudflare', url: 'https://developers.cloudflare.com/changelog/rss/index.xml', category: 'Blogs' },
			{ name: 'GitHub Blog', url: 'https://github.blog/feed/', category: 'Blogs' },
			{ name: 'Init 7', url: 'https://blog.init7.net/en/feed/', category: 'Blogs' },
			{ name: 'Transfermarkt', url: 'https://www.transfermarkt.de/rss/news', category: 'Sport' },
			{ name: 'Sportschau', url: 'https://www.sportschau.de/fussball/index~rss2.xml', category: 'Sport' }
		];

		// Get unique categories
		const availableCategories = [...new Set(availableFeeds.map((f) => f.category))];

		// Get selected categories from query params
		const selectedCategories = url.searchParams.get('categories');
		let feedsToFetch: FeedConfig[] = [];

		if (selectedCategories && selectedCategories.trim() !== '') {
			const selectedCategoryNames = selectedCategories
				.split(',')
				.map((name) => name.trim())
				.filter(Boolean);
			feedsToFetch = availableFeeds.filter((feed) => selectedCategoryNames.includes(feed.category));
		}

		// Only fetch if there are feeds to fetch
		let results: FeedData[] = [];
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

		// Return processed feed data with available categories list
		return json({
			success: true,
			feeds: results,
			availableCategories: availableCategories
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
