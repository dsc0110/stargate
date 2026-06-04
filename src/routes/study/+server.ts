import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { StudyIndexItem } from './types';
import { isStudyImageKey, STUDY_INDEX_KEY, toDataUrl, toStudyImageKey } from './utils';

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

async function getMixedStudyItem(platform: App.Platform | undefined, selectedCategory: string, indexItems: StudyIndexItem[], excludedKind?: string, excludedId?: string) {
	const filteredItems = indexItems.filter((item) => mapCategory(item.category) === selectedCategory);
	const imageNames = filteredItems.map((item) => toStudyImageKey(item.filename));
	const { namespace, bindingName } = getStudyNamespaceForCategory(platform, selectedCategory);

	if (platform?.env.STARGATE_BUCKET === undefined) {
		return {
			error: 'STARGATE_BUCKET binding not available'
		};
	}

	if (namespace === undefined) {
		return {
			error: `${bindingName} binding not available`
		};
	}

	const cardKeys = (await namespace.list({ limit: 1000 })).keys.map((item) => item.name).filter((name): name is string => Boolean(name));
	const allCombinedItems = [...imageNames.map((name) => ({ kind: 'image' as const, id: name })), ...cardKeys.map((key) => ({ kind: 'card' as const, id: key }))];
	const combinedItems = allCombinedItems.filter((item) => !(item.kind === excludedKind && item.id === excludedId));
	const selectableItems = combinedItems.length > 0 ? combinedItems : allCombinedItems;

	if (selectableItems.length === 0) {
		return {
			studyImageSrc: null,
			studyImageName: null,
			studyCardKey: null,
			studyCardValue: null
		};
	}

	const selectedItem = selectableItems[Math.floor(Math.random() * selectableItems.length)];
	if (selectedItem.kind === 'card') {
		return {
			studyImageSrc: null,
			studyImageName: null,
			studyCardKey: selectedItem.id,
			studyCardValue: await namespace.get(selectedItem.id)
		};
	}

	const object = await platform.env.STARGATE_BUCKET.get(selectedItem.id);
	if (object === null) {
		return {
			studyImageSrc: null,
			studyImageName: null,
			studyCardKey: null,
			studyCardValue: null
		};
	}

	return {
		studyImageSrc: toDataUrl(object.httpMetadata?.contentType ?? 'image/jpeg', new Uint8Array(await object.arrayBuffer())),
		studyImageName: selectedItem.id,
		studyCardKey: null,
		studyCardValue: null
	};
}

export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		if (platform?.env.STARGATE_BUCKET === undefined) {
			return json(
				{
					success: false,
					studyImageSrc: null,
					studyImageName: null,
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
		const mixedItem = await getMixedStudyItem(platform, selectedCategory, indexItems, url.searchParams.get('excludeKind') || undefined, url.searchParams.get('excludeId') || undefined);
		if ('error' in mixedItem) {
			return json(
				{
					success: false,
					studyImageSrc: null,
					studyImageName: null,
					studyCardKey: null,
					studyCardValue: null,
					error: mixedItem.error
				},
				{ status: 500 }
			);
		}

		return json({
			success: true,
			...mixedItem
		});
	} catch (error) {
		console.error('Failed to load study image:', error);
		return json(
			{
				success: false,
				studyImageSrc: null,
				studyImageName: null,
				studyCardKey: null,
				studyCardValue: null,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			},
			{ status: 500 }
		);
	}
};
