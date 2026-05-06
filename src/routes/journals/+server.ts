import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { BlogConfig } from './types';
import { getOptimizedConfig } from './config';
import { RSSService, type RSSConfig } from '$lib/rss-service';

// Get optimized configuration and create RSS service
const config = getOptimizedConfig();
const rssService = new RSSService(config as RSSConfig);

export const GET: RequestHandler = async ({ platform }) => {
	try {
		// Get journal configuration from environment variable
		const journalFeeds = platform?.env?.JOURNALS_FEEDS || (process.env.JOURNALS_FEEDS ? JSON.parse(process.env.JOURNALS_FEEDS) : null);

		if (!journalFeeds) {
			return json(
				{
					success: false,
					error: 'JOURNALS_FEEDS environment variable not found. Run with: wrangler pages dev'
				},
				{ status: 500 }
			);
		}

		let availableFeeds: BlogConfig[] = [];

		try {
			availableFeeds = Array.isArray(journalFeeds) ? journalFeeds : JSON.parse(journalFeeds);
		} catch (error) {
			console.error('Failed to parse JOURNALS_FEEDS:', error);
			return json(
				{
					success: false,
					error: 'Invalid journal configuration format'
				},
				{ status: 500 }
			);
		}

		// Process all journal feeds using shared RSS service (no category filtering)
		const results = await rssService.processFeeds(availableFeeds, 'journal');

		// Return processed journal data
		return json(
			{
				success: true,
				feeds: results,
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
