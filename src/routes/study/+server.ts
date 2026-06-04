import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { StudyIndexItem } from './types';
import { isStudyImageKey, pickRandomItem, STUDY_INDEX_KEY, toDataUrl, toStudyImageKey } from './utils';

const STUDY_CATEGORIES = ['Español', 'Româna'] as const;
const DEFAULT_STUDY_CATEGORY = STUDY_CATEGORIES[0];

function mapCategory(rawCategory: string | undefined) {
	return rawCategory === 'Español' || rawCategory === 'Româna' ? rawCategory : null;
}

function getStudyNamespaceForCategory(platform: App.Platform | undefined, category: string) {
	if (category === 'Româna') {
		return {
			namespace: platform?.env.STARGATE_STUDY_RO,
			bindingName: 'STARGATE_STUDY_RO'
		};
	}

	return {
		namespace: platform?.env.STARGATE_STUDY_ES,
		bindingName: 'STARGATE_STUDY_ES'
	};
}

export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		const requestedView = url.searchParams.get('view')?.trim() ?? 'pictures';

		if (requestedView === 'cards') {
			const requestedCategory = url.searchParams.get('category')?.trim() ?? '';
			const { namespace, bindingName } = getStudyNamespaceForCategory(platform, requestedCategory);

			if (namespace === undefined) {
				return json(
					{
						success: false,
						studyCardKey: null,
						studyCardValue: null,
						error: `${bindingName} binding not available`
					},
					{ status: 500 }
				);
			}

			const cardList = await namespace.list({ limit: 1000 });
			const cardKeys = cardList.keys.map((item) => item.name).filter((name): name is string => Boolean(name));
			const excludedCardKey = url.searchParams.get('exclude') || undefined;
			const studyCardKey = pickRandomItem(cardKeys, excludedCardKey) ?? cardKeys[0] ?? null;
			const studyCardValue = studyCardKey ? await namespace.get(studyCardKey) : null;

			return json({
				success: true,
				studyCardKey,
				studyCardValue
			});
		}

		if (platform?.env.STARGATE_BUCKET === undefined) {
			return json(
				{
					success: false,
					studyImageSrc: null,
					studyImageName: null,
					studyImageNames: [],
					studyCardKey: null,
					studyCardValue: null,
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
					studyImageNames: [],
					studyCardKey: null,
					studyCardValue: null
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
					studyCardKey: null,
					studyCardValue: null,
					error: 'Invalid study index format'
				},
				{ status: 500 }
			);
		}

		const availableCategories = [...STUDY_CATEGORIES];
		const requestedCategory = url.searchParams.get('category')?.trim() ?? '';
		const selectedCategory = availableCategories.includes(requestedCategory as (typeof availableCategories)[number]) ? requestedCategory : DEFAULT_STUDY_CATEGORY;

		const filteredItems = indexItems.filter((item) => mapCategory(item.category) === selectedCategory);
		const imageNames = filteredItems.map((item) => toStudyImageKey(item.filename));

		if (imageNames.length === 0) {
			return json({
				success: true,
				studyImageSrc: null,
				studyImageName: null,
				studyImageNames: [],
				studyCardKey: null,
				studyCardValue: null
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
				studyImageNames: imageNames,
				studyCardKey: null,
				studyCardValue: null
			});
		}

		const object = await platform.env.STARGATE_BUCKET.get(studyImageName);
		if (object === null) {
			return json({
				success: true,
				studyImageSrc: null,
				studyImageName: null,
				studyImageNames: imageNames,
				studyCardKey: null,
				studyCardValue: null
			});
		}

		return json({
			success: true,
			studyImageSrc: toDataUrl(object.httpMetadata?.contentType ?? 'image/jpeg', new Uint8Array(await object.arrayBuffer())),
			studyImageName,
			studyImageNames: imageNames,
			studyCardKey: null,
			studyCardValue: null
		});
	} catch (error) {
		console.error('Failed to load study image:', error);
		return json(
			{
				success: false,
				studyImageSrc: null,
				studyImageName: null,
				studyImageNames: [],
				studyCardKey: null,
				studyCardValue: null,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			},
			{ status: 500 }
		);
	}
};
