import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { FeedConfig, RSSConfig } from './types';
import { getOptimizedConfig } from './config';
import { RSSService } from './rss-service';
import { env } from '$env/dynamic/private';

// Get optimized configuration and create RSS service
const config = getOptimizedConfig();
const rssService = new RSSService(config as RSSConfig);

export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		if (platform?.env?.STARGATE_BUCKET === undefined) {
			return json(
				{
					success: false,
					error: 'STARGATE_BUCKET binding not available'
				},
				{ status: 500 }
			);
		}

		const feedsObject = await platform.env.STARGATE_BUCKET.get('feeds/rss-feeds.json');
		let availableFeeds: FeedConfig[] = [];

		if (feedsObject === null) {
			try {
				const devRssFeedsJson = JSON.parse(env.DEV_RSS_FEEDS ?? '[]');
				availableFeeds = Array.isArray(devRssFeedsJson) ? devRssFeedsJson : [];
			} catch {
				return json(
					{
						success: false,
						error: 'Feed configuration file feeds/rss-feeds.json not found in bucket and RSS_FEEDS env invalid'
					},
					{ status: 500 }
				);
			}
		} else {
			try {
				const parsed = JSON.parse(await feedsObject.text());
				availableFeeds = Array.isArray(parsed) ? parsed : [];
			} catch (error) {
				console.error('Failed to parse feeds/rss-feeds.json:', error);
				return json(
					{
						success: false,
						error: 'Invalid feed configuration format in feeds/rss-feeds.json'
					},
					{ status: 500 }
				);
			}
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
