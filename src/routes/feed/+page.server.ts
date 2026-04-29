import type { PageServerLoad } from './$types';
import type { MultipleFeedResponse } from './types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/feed', {
			method: 'GET'
		});

		const data = (await response.json()) as MultipleFeedResponse;

		if (data.success) {
			return {
				feeds: data.feeds
			};
		} else {
			return {
				error: data.error || 'Failed to load feeds'
			};
		}
	} catch (error) {
		console.error('Error loading feeds:', error);
		return {
			error: 'Failed to load feed data'
		};
	}
};
