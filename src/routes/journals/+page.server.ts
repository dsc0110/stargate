import type { PageServerLoad } from './$types';
import type { BlogFeedResponse } from './types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		// Fetch all blog feeds
		const response = await fetch('/journals', {
			method: 'GET'
		});

		const data = (await response.json()) as BlogFeedResponse;

		if (data.success) {
			return {
				feeds: data.feeds || [],
				cacheInfo: data.cacheInfo
			};
		} else {
			return {
				error: data.error || 'Failed to load blog feeds',
				cacheInfo: data.cacheInfo
			};
		}
	} catch (error) {
		console.error('Error loading blog feeds:', error);
		return {
			error: 'Failed to load blog data'
		};
	}
};
