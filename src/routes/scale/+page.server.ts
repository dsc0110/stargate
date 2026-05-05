import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform }) => {
	try {
		if (platform?.env.STARGATE_BUCKET === undefined) {
			return {
				scaleResults: [],
				bodySizeCm: 0,
				birthDate: ''
			};
		}

		// Get body size from environment variable
		const bodySizeCm = parseFloat(platform?.env.BODY_SIZE_CM || '0');

		const object = await platform?.env.STARGATE_BUCKET.get('scale/scale-results.json');
		if (object === null) {
			return {
				scaleResults: [],
				bodySizeCm
			};
		}

		const parsed = JSON.parse(await object.text());
		const scaleResults = Array.isArray(parsed) ? parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

		return {
			scaleResults,
			bodySizeCm
		};
	} catch (error) {
		console.error('Error getting scale results data:', error);
		return {
			scaleResults: [],
			bodySizeCm: 0,
			birthDate: ''
		};
	}
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		console.log('Scale form action triggered');

		if (platform?.env.STARGATE_BUCKET === undefined) {
			return fail(500, { message: 'R2 bucket not available' });
		}

		try {
			const formData = await request.formData();
			const date = formData.get('date') as string;
			const weight = parseFloat(formData.get('weight') as string);
			const bodyFat = parseFloat(formData.get('bodyFat') as string);

			// Create the scale result item - only store raw data
			const scaleResultItem = {
				date: date,
				weight: weight,
				bodyFat: bodyFat,
				timestamp: new Date().toISOString()
			};

			// Get existing scale results
			let scaleResults = [];
			try {
				const existingObject = await platform?.env.STARGATE_BUCKET.get('scale/scale-results.json');
				if (existingObject !== null) {
					const existing = JSON.parse(await existingObject.text());
					scaleResults = Array.isArray(existing) ? existing : [];
				}
			} catch (error) {
				console.log('No existing scale results found, creating new array');
				scaleResults = [];
			}

			// Add new item and sort by date (newest first)
			scaleResults.push(scaleResultItem);
			scaleResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

			// Save back to R2
			await platform?.env.STARGATE_BUCKET.put('scale/scale-results.json', JSON.stringify(scaleResults, null, 2));

			console.log('Scale result saved successfully:', scaleResultItem);

			return {
				success: true,
				scaleResults: scaleResults,
				message: 'Scale result saved successfully!'
			};
		} catch (error) {
			console.error('Error saving scale result:', error);
			return fail(500, { message: 'Failed to save scale result' });
		}
	}
};
