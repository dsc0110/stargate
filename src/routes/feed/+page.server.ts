import type { PageServerLoad } from './$types';
import type { MultipleFeedResponse } from './types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		const selectedCategories = url.searchParams.get('categories') || '';
		const selectedCategoriesArray = selectedCategories.split(',').filter(Boolean);

		// Define available categories (should match server-side list)
		const availableCategories = ['News', 'Social', 'Tech'];

		// If no categories selected, return early without making API call
		if (selectedCategoriesArray.length === 0) {
			return {
				feeds: [],
				availableCategories,
				selectedCategories: []
			};
		}

		const response = await fetch(`/feed?categories=${encodeURIComponent(selectedCategories)}`, {
			method: 'GET'
		});

		const data = (await response.json()) as MultipleFeedResponse;

		if (data.success) {
			return {
				feeds: data.feeds,
				availableCategories: data.availableCategories || availableCategories,
				selectedCategories: selectedCategoriesArray
			};
		} else {
			return {
				error: data.error || 'Failed to load feeds',
				availableCategories: data.availableCategories || availableCategories,
				selectedCategories: selectedCategoriesArray
			};
		}
	} catch (error) {
		console.error('Error loading feeds:', error);
		return {
			error: 'Failed to load feed data',
			availableCategories: ['News', 'Social', 'Tech'],
			selectedCategories: []
		};
	}
};
