import type { PageServerLoad } from './$types';
import type { StudyIndexItem } from './types';
import { createEmptyResponse, isStudyImageKey, pickRandomItem, STUDY_INDEX_KEY, toDataUrl, toStudyImageKey } from './utils';

export const load: PageServerLoad = async ({ platform, url }) => {
	if (platform?.env.STARGATE_BUCKET === undefined) {
		return createEmptyResponse();
	}

	const indexObject = await platform.env.STARGATE_BUCKET.get(STUDY_INDEX_KEY);
	if (indexObject === null) {
		return createEmptyResponse();
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
		return createEmptyResponse();
	}

	const availableCategories = [...new Set(indexItems.map((item) => item.category?.trim()).filter((category): category is string => Boolean(category)))].sort((a, b) => a.localeCompare(b));
	const categoryImageCounts = indexItems.reduce<Record<string, number>>((counts, item) => {
		const category = item.category?.trim();
		if (!category) {
			return counts;
		}

		counts[category] = (counts[category] ?? 0) + 1;
		return counts;
	}, {});

	const requestedCategory = url.searchParams.get('category')?.trim() ?? '';
	const selectedCategory = availableCategories.includes(requestedCategory) ? requestedCategory : (availableCategories[0] ?? '');

	const filteredItems = selectedCategory ? indexItems.filter((item) => item.category?.trim() === selectedCategory) : indexItems;
	const imageNames = filteredItems.map((item) => toStudyImageKey(item.filename));

	if (imageNames.length === 0) {
		return {
			...createEmptyResponse(),
			availableCategories,
			categoryImageCounts,
			selectedCategory
		};
	}

	const requestedImageName = url.searchParams.get('image') || undefined;
	const studyImageName = imageNames.includes(requestedImageName ?? '') ? requestedImageName : (pickRandomItem(imageNames) ?? imageNames[0]);

	if (!studyImageName) {
		return {
			studyImageSrc: null,
			studyImageName: null,
			studyImageNames: imageNames,
			availableCategories,
			categoryImageCounts,
			selectedCategory
		};
	}

	const object = await platform.env.STARGATE_BUCKET.get(studyImageName);
	if (object === null) {
		return {
			studyImageSrc: null,
			studyImageName: null,
			studyImageNames: imageNames,
			availableCategories,
			categoryImageCounts,
			selectedCategory
		};
	}

	return {
		studyImageSrc: toDataUrl(object.httpMetadata?.contentType ?? 'image/jpeg', new Uint8Array(await object.arrayBuffer())),
		studyImageName,
		studyImageNames: imageNames,
		availableCategories,
		categoryImageCounts,
		selectedCategory
	};
};
