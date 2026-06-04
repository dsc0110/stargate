import type { PageServerLoad } from './$types';
import type { StudyIndexItem } from './types';
import { createEmptyResponse, isStudyImageKey, pickRandomItem, STUDY_INDEX_KEY, toDataUrl, toStudyImageKey } from './utils';

const STUDY_CATEGORIES = ['Español', 'Româna'] as const;
const DEFAULT_STUDY_CATEGORY = STUDY_CATEGORIES[0];

function mapCategory(rawCategory: string | undefined) {
	return rawCategory === 'Español' || rawCategory === 'Româna' ? rawCategory : null;
}

function getStudyNamespaceForCategory(platform: App.Platform | undefined, category: string) {
	if (category === 'Româna') {
		return platform?.env.STARGATE_STUDY_RO;
	}

	return platform?.env.STARGATE_STUDY_ES;
}

export const load: PageServerLoad = async ({ platform }) => {
	const emptyResponse = createEmptyResponse();
	emptyResponse.availableCategories = [...STUDY_CATEGORIES];
	emptyResponse.selectedCategory = DEFAULT_STUDY_CATEGORY;
	emptyResponse.categoryImageCounts = {
		Español: 0,
		Româna: 0
	};

	if (platform?.env.STARGATE_BUCKET === undefined) {
		return emptyResponse;
	}

	const indexObject = await platform.env.STARGATE_BUCKET.get(STUDY_INDEX_KEY);
	if (indexObject === null) {
		emptyResponse.selectedViewMode = emptyResponse.hasStudyCards ? 'cards' : 'pictures';
		return emptyResponse;
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
		emptyResponse.selectedViewMode = emptyResponse.hasStudyCards ? 'cards' : 'pictures';
		return emptyResponse;
	}

	const availableCategories = [...STUDY_CATEGORIES];
	const categoryImageCounts = indexItems.reduce<Record<string, number>>(
		(counts, item) => {
			const category = mapCategory(item.category);
			if (!category) {
				return counts;
			}

			counts[category] = (counts[category] ?? 0) + 1;
			return counts;
		},
		{
			Español: 0,
			Româna: 0
		}
	);

	const selectedCategory = DEFAULT_STUDY_CATEGORY;
	const studyNamespace = getStudyNamespaceForCategory(platform, selectedCategory);

	if (studyNamespace !== undefined) {
		const cardList = await studyNamespace.list({ limit: 1000 });
		const cardKeys = cardList.keys.map((item) => item.name).filter((name): name is string => Boolean(name));
		emptyResponse.hasStudyCards = cardKeys.length > 0;
		emptyResponse.studyCardKey = pickRandomItem(cardKeys) ?? null;
		if (emptyResponse.studyCardKey !== null) {
			emptyResponse.studyCardValue = await studyNamespace.get(emptyResponse.studyCardKey);
		}
	}

	const filteredItems = indexItems.filter((item) => mapCategory(item.category) === selectedCategory);
	const imageNames = filteredItems.map((item) => toStudyImageKey(item.filename));

	if (imageNames.length === 0) {
		return {
			...emptyResponse,
			selectedViewMode: emptyResponse.hasStudyCards ? 'cards' : 'pictures',
			availableCategories,
			categoryImageCounts,
			selectedCategory
		};
	}

	const studyImageName = pickRandomItem(imageNames) ?? imageNames[0];

	if (!studyImageName) {
		return {
			...emptyResponse,
			selectedViewMode: 'pictures',
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
			...emptyResponse,
			selectedViewMode: 'pictures',
			studyImageSrc: null,
			studyImageName: null,
			studyImageNames: imageNames,
			availableCategories,
			categoryImageCounts,
			selectedCategory
		};
	}

	return {
		...emptyResponse,
		selectedViewMode: 'pictures',
		studyImageSrc: toDataUrl(object.httpMetadata?.contentType ?? 'image/jpeg', new Uint8Array(await object.arrayBuffer())),
		studyImageName,
		studyImageNames: imageNames,
		availableCategories,
		categoryImageCounts,
		selectedCategory
	};
};
