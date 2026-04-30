import type { PageServerLoad } from './$types';
import type { MultipleFeedResponse } from './types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		const selectedCategories = url.searchParams.get('categories') || '';
		const selectedCategoriesArray = selectedCategories.split(',').filter(Boolean);

		// Always make API call to get available categories, even if no categories selected
		const response = await fetch(`/feed?categories=${encodeURIComponent(selectedCategories)}`, {
			method: 'GET'
		});

		const data = (await response.json()) as MultipleFeedResponse;

		if (data.success) {
			return {
				feeds: data.feeds || [],
				availableCategories: data.availableCategories || [],
				selectedCategories: selectedCategoriesArray,
				cacheInfo: data.cacheInfo
			};
		} else {
			return {
				error: data.error || 'Failed to load feeds',
				availableCategories: data.availableCategories || [],
				selectedCategories: selectedCategoriesArray,
				cacheInfo: data.cacheInfo
			};
		}
	} catch (error) {
		console.error('Error loading feeds:', error);
		return {
			error: 'Failed to load feed data',
			availableCategories: [],
			selectedCategories: []
		};
	}
};
