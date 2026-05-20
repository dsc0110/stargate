import type { PageServerLoad } from './$types';
import type { MultipleFeedResponse } from './types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		const selectedCategories = url.searchParams.get('categories') || '';
		const selectedCategoriesArray = selectedCategories.split(',').filter(Boolean);

		// Load feed configuration metadata once; item loading happens client-side by category.
		const response = await fetch('/feeds', {
			method: 'GET',
			headers: {
				accept: 'application/json'
			}
		});

		const contentType = response.headers.get('content-type') || '';
		if (!response.ok || !contentType.includes('application/json')) {
			const bodyText = await response.text();
			console.error('Unexpected /feeds response:', response.status, contentType, bodyText.slice(0, 200));
			return {
				error: 'Failed to load feed data',
				availableCategories: [],
				selectedCategories: selectedCategoriesArray
			};
		}

		const data = (await response.json()) as MultipleFeedResponse;

		if (data.success) {
			return {
				feeds: [],
				availableCategories: data.availableCategories || [],
				categoryFeeds: data.categoryFeeds || {},
				selectedCategories: selectedCategoriesArray,
				cacheInfo: data.cacheInfo
			};
		} else {
			return {
				error: data.error || 'Failed to load feeds',
				availableCategories: data.availableCategories || [],
				categoryFeeds: data.categoryFeeds || {},
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
