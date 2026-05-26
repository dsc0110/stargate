import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { StudyIndexItem } from './types';
import { isStudyImageKey, pickRandomItem, STUDY_INDEX_KEY, toDataUrl, toStudyImageKey } from './utils';

export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		if (platform?.env.STARGATE_BUCKET === undefined) {
			return json(
				{
					success: false,
					studyImageSrc: null,
					studyImageName: null,
					studyImageNames: [],
					error: 'STARGATE_BUCKET binding not available'
				},
				{ status: 500 }
			);
		}

		const indexObject = await platform.env.STARGATE_BUCKET.get(STUDY_INDEX_KEY);
		if (indexObject === null) {
			return json(
				{
					success: true,
					studyImageSrc: null,
					studyImageName: null,
					studyImageNames: []
				},
				{ status: 200 }
			);
		}

		let indexItems: StudyIndexItem[] = [];
		try {
			const parsed = JSON.parse(await indexObject.text()) as unknown;
			if (Array.isArray(parsed)) {
				indexItems = parsed.filter((item): item is StudyIndexItem => {
					if (typeof item !== 'object' || item === null) {
						return false;
					}

					const filename = (item as { filename?: unknown }).filename;
					return typeof filename === 'string' && filename.trim().length > 0 && isStudyImageKey(filename);
				});
			}
		} catch {
			return json(
				{
					success: false,
					studyImageSrc: null,
					studyImageName: null,
					studyImageNames: [],
					error: 'Invalid study index format'
				},
				{ status: 500 }
			);
		}

		const availableCategories = [...new Set(indexItems.map((item) => item.category?.trim()).filter((category): category is string => Boolean(category)))].sort((a, b) => a.localeCompare(b));
		const requestedCategory = url.searchParams.get('category')?.trim() ?? '';
		const selectedCategory = availableCategories.includes(requestedCategory) ? requestedCategory : (availableCategories[0] ?? '');

		const filteredItems = selectedCategory ? indexItems.filter((item) => item.category?.trim() === selectedCategory) : indexItems;
		const imageNames = filteredItems.map((item) => toStudyImageKey(item.filename));

		if (imageNames.length === 0) {
			return json({
				success: true,
				studyImageSrc: null,
				studyImageName: null,
				studyImageNames: []
			});
		}

		const requestedImageName = url.searchParams.get('image') || undefined;
		const excludedImageName = url.searchParams.get('exclude') || undefined;
		const studyImageName = imageNames.includes(requestedImageName ?? '') ? requestedImageName : (pickRandomItem(imageNames, excludedImageName) ?? imageNames[0]);

		if (!studyImageName) {
			return json({
				success: true,
				studyImageSrc: null,
				studyImageName: null,
				studyImageNames: imageNames
			});
		}

		const object = await platform.env.STARGATE_BUCKET.get(studyImageName);
		if (object === null) {
			return json({
				success: true,
				studyImageSrc: null,
				studyImageName: null,
				studyImageNames: imageNames
			});
		}

		return json({
			success: true,
			studyImageSrc: toDataUrl(object.httpMetadata?.contentType ?? 'image/jpeg', new Uint8Array(await object.arrayBuffer())),
			studyImageName,
			studyImageNames: imageNames
		});
	} catch (error) {
		console.error('Failed to load study image:', error);
		return json(
			{
				success: false,
				studyImageSrc: null,
				studyImageName: null,
				studyImageNames: [],
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			},
			{ status: 500 }
		);
	}
};
