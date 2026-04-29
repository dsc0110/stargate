import type { PageServerLoad } from './$types';
import type { MultipleFeedResponse } from './types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		const selectedFeeds = url.searchParams.get('feeds') || '';

		const response = await fetch(`/feed?feeds=${encodeURIComponent(selectedFeeds)}`, {
			method: 'GET'
		});

		const data = (await response.json()) as MultipleFeedResponse;

		if (data.success) {
			return {
				feeds: data.feeds,
				availableFeeds: data.availableFeeds || [],
				selectedFeeds: selectedFeeds.split(',').filter(Boolean)
			};
		} else {
			return {
				error: data.error || 'Failed to load feeds',
				availableFeeds: data.availableFeeds || [],
				selectedFeeds: []
			};
		}
	} catch (error) {
		console.error('Error loading feeds:', error);
		return {
			error: 'Failed to load feed data',
			availableFeeds: ['Reddit', 'BBC News'],
			selectedFeeds: []
		};
	}
};
