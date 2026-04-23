import { fail, json } from '@sveltejs/kit';
import { testPortfolio as testPortfolio } from '$lib/portfolio.js';
import { ConversionHelper } from './conversion-helper';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform }) => {
	try {
		if (platform?.env.PORTFOLIO_BUCKET === undefined) {
			// return test data sorted newest-first
			const portfolio = Array.isArray(testPortfolio) ? [...testPortfolio].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : testPortfolio;
			return { portfolio };
		}

		const object = await platform?.env.PORTFOLIO_BUCKET.get('portfolio.json');
		if (object === null) {
			const portfolio = Array.isArray(testPortfolio) ? [...testPortfolio].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : testPortfolio;
			return { portfolio };
		}

		const parsed = JSON.parse(await object.text());
		const portfolio = Array.isArray(parsed) ? parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : parsed;

		return { portfolio };
	} catch (error) {
		console.error('Error getting portfolio data:', error);
		return { portfolio: testPortfolio };
	}
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		console.log('Form action triggered');

		if (platform?.env.PORTFOLIO_BUCKET === undefined) {
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
			const zkbAccountInEuro = await ConversionHelper.convertToEuroValue('CHF', zkbAll);
			console.log(`Converted ${zkbAll} CHF to ${zkbAccountInEuro} EUR`);

			// Create the portfolio item
			const portfolioItem = {
				date: date,
				accounts: {
					dkbCash: dkbCash,
					dkbDepot: dkbDepot,
					zkbCash: zkbAccountInEuro
				},
				timestamp: new Date().toISOString()
			};

			// Get portfolio.json from R2 to append new record
			const existingPortfolio = await platform?.env.PORTFOLIO_BUCKET.get('portfolio.json');
			let portfolio = [];

			if (existingPortfolio) {
				const existingBody = await existingPortfolio.text();
				portfolio = JSON.parse(existingBody);
			}

			// Append new record and ensure newest-first order before saving
			portfolio.push(portfolioItem);
			portfolio.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

			const filename = `portfolio.json`;

			// Store in R2 bucket
			await platform.env.PORTFOLIO_BUCKET.put(filename, JSON.stringify(portfolio), {
				httpMetadata: {
					contentType: 'application/json'
				}
			});

			return {
				success: true,
				filename,
				data: portfolioItem,
				portfolio: portfolio,
				message: 'Portfolio item saved successfully!'
			};
		} catch (error) {
			console.error('Error saving portfolio item:', error);
			return fail(500, { message: 'Failed to save portfolio item' });
		}
	}
};
