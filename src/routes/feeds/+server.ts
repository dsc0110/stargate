import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { FeedConfig } from './types';
import { getOptimizedConfig } from './config';
import { RSSService, type RSSConfig } from '$lib/rss-service';

// Get optimized configuration and create RSS service
const config = getOptimizedConfig();
const rssService = new RSSService(config as RSSConfig);

export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		// Get feed configuration from environment variable
		const newsFeeds = platform?.env?.NEWS_FEEDS || (process.env.NEWS_FEEDS ? JSON.parse(process.env.NEWS_FEEDS) : null);

		if (!newsFeeds) {
			return json(
				{
					success: false,
					error: 'NEWS_FEEDS environment variable not found. Run with: wrangler pages dev'
				},
				{ status: 500 }
			);
		}

		let availableFeeds: FeedConfig[] = [];

		try {
			availableFeeds = Array.isArray(newsFeeds) ? newsFeeds : JSON.parse(newsFeeds);
		} catch (error) {
			console.error('Failed to parse NEWS_FEEDS:', error);
			return json(
				{
					success: false,
					error: 'Invalid feed configuration format'
				},
				{ status: 500 }
			);
		}

		// Get unique categories
		const availableCategories = [...new Set(availableFeeds.map((f) => f.category))];

		// Build category to feeds mapping
		const categoryFeeds: Record<string, string[]> = {};
		availableFeeds.forEach((feed) => {
			if (!categoryFeeds[feed.category]) {
				categoryFeeds[feed.category] = [];
			}
			if (!categoryFeeds[feed.category].includes(feed.name)) {
				categoryFeeds[feed.category].push(feed.name);
			}
		});

		// Get selected categories from query params
		const selectedCategories = url.searchParams.get('categories');
		let categoryFilter: string[] | undefined;

		if (selectedCategories && selectedCategories.trim() !== '') {
			categoryFilter = selectedCategories
				.split(',')
				.map((name) => name.trim())
				.filter(Boolean);
		}

		// Process feeds using shared RSS service
		const results = categoryFilter ? await rssService.processFeeds(availableFeeds, 'news', categoryFilter) : [];

		// Return processed feed data with available categories list
		return json(
			{
				success: true,
				feeds: results,
				availableCategories: availableCategories,
				categoryFeeds: categoryFeeds,
				cacheInfo: {
					timestamp: Date.now(),
					cacheDuration: config.CACHE_DURATION
				}
			},
			{
				headers: rssService.getResponseHeaders(results.length)
			}
		);
	} catch (error) {
		console.error('RSS parsing error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			},
			{
				status: 500,
				headers: {
					// Don't cache errors
					'Cache-Control': 'no-cache, no-store, must-revalidate'
				}
			}
		);
	}
};
