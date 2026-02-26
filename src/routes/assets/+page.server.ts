import { fail, json } from '@sveltejs/kit';
import { testAssets } from '$lib/assets.js';
import { ConversionHelper } from './ConversionHelper';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform }) => {
	try {
		if (platform?.env.ASSETS_BUCKET === undefined) {
			// return test data sorted newest-first
			const assets = Array.isArray(testAssets)
				? [...testAssets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
				: testAssets;
			return { assets };
		}

		const object = await platform?.env.ASSETS_BUCKET.get('assets.json');
		if (object === null) {
			const assets = Array.isArray(testAssets)
				? [...testAssets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
				: testAssets;
			return { assets };
		}

		const parsed = JSON.parse(await object.text());
		const assets = Array.isArray(parsed)
			? parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			: parsed;

		return { assets };

	} catch (error) {
		console.error('Error getting asset data:', error);
		// return fail(500, { message: 'Failed to load asset data' });
		return { assets: testAssets };
	}
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		console.log('Form action triggered');

		if (platform?.env.ASSETS_BUCKET === undefined) {
			return fail(500, { message: 'R2 bucket not available' });
		}

		try {
			const formData = await request.formData();
			const date = formData.get('date') as string;
			// const dateString = formData.get('date') as string;
			// const date = new Date(dateString).toLocaleDateString('de-DE');
			const dkbAll = parseFloat(formData.get('dkbAll') as string);
			const dkbDepot = parseFloat(formData.get('dkbDepot') as string);
			const zkbAll = parseFloat(formData.get('zkbAll') as string);

			// parse numeric values from the form (fallback to 0)
			const dkbCash = dkbAll - dkbDepot;
			const zkbAccountInEuro = await ConversionHelper.convertToEuroValue("CHF", zkbAll);
			console.log(`Converted ${zkbAll} CHF to ${zkbAccountInEuro} EUR`);

			// Create the asset record
			const assetRecord = {
				date: date,
				accounts: {
					dkbCash: dkbCash,
					dkbDepot: dkbDepot,
					zkbCash: zkbAccountInEuro
				},
				timestamp: new Date().toISOString()
			};

			// Get assets.json from R2 to append new record
			const existingAssets = await platform?.env.ASSETS_BUCKET.get('assets.json');
			let assetsData = [];

			if (existingAssets) {
				const existingBody = await existingAssets.text();
				assetsData = JSON.parse(existingBody);
			}

			// Append new record and ensure newest-first order before saving
			assetsData.push(assetRecord);
			assetsData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

			// Update assetRecord to be the full array
			//Object.assign(assetRecord, assetsData);

			// Save updated assetsData back to R2

			// Generate a unique filename based on date
			// const filename = `asset-${date}-${Date.now()}.json`;
			const filename = `assets.json`;

			// Store in R2 bucket
			await platform.env.ASSETS_BUCKET.put(filename, JSON.stringify(assetsData), {
				httpMetadata: {
					contentType: 'application/json'
				}
			});

			return {
				success: true,
				filename,
				data: assetRecord,
				assets: assetsData,
				message: 'Asset data saved successfully!'
			};
		} catch (error) {
			console.error('Error saving asset data:', error);
			return fail(500, { message: 'Failed to save asset data' });
		}
	}
};
