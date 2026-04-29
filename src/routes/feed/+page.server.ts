import type { PageServerLoad } from './$types';
import type { MultipleFeedResponse } from './types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		const selectedFeeds = url.searchParams.get('feeds') || '';
		const selectedFeedsArray = selectedFeeds.split(',').filter(Boolean);

		// Define available feeds (should match server-side list)
		const availableFeeds = ['Reddit', 'BBC News'];

		// If no feeds selected, return early without making API call
		if (selectedFeedsArray.length === 0) {
			return {
				feeds: [],
				availableFeeds,
				selectedFeeds: []
			};
		}

		const response = await fetch(`/feed?feeds=${encodeURIComponent(selectedFeeds)}`, {
			method: 'GET'
		});

		const data = (await response.json()) as MultipleFeedResponse;

		if (data.success) {
			return {
				feeds: data.feeds,
				availableFeeds: data.availableFeeds || availableFeeds,
				selectedFeeds: selectedFeedsArray
			};
		} else {
			return {
				error: data.error || 'Failed to load feeds',
				availableFeeds: data.availableFeeds || availableFeeds,
				selectedFeeds: selectedFeedsArray
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
