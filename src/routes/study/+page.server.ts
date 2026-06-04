import type { PageServerLoad } from './$types';
import type { StudyIndexItem } from './types';
import { createEmptyResponse, isStudyImageKey, STUDY_INDEX_KEY, toDataUrl, toStudyImageKey } from './utils';

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

async function loadRandomStudyItem(platform: App.Platform | undefined, category: string, indexItems: StudyIndexItem[]) {
	const filteredItems = indexItems.filter((item) => mapCategory(item.category) === category);
	const imageNames = filteredItems.map((item) => toStudyImageKey(item.filename));
	const studyNamespace = getStudyNamespaceForCategory(platform, category);
	const cardKeys = studyNamespace === undefined ? [] : (await studyNamespace.list({ limit: 1000 })).keys.map((item) => item.name).filter((name): name is string => Boolean(name));
	const combinedItems = [...imageNames.map((name) => ({ kind: 'image' as const, id: name })), ...cardKeys.map((key) => ({ kind: 'card' as const, id: key }))];
	const selectedItem = combinedItems.length === 0 ? null : combinedItems[Math.floor(Math.random() * combinedItems.length)];

	if (selectedItem === null) {
		return {
			studyImageSrc: null,
			studyImageName: null,
			studyCardKey: null,
			studyCardValue: null,
			hasStudyCards: cardKeys.length > 0
		};
	}

	if (selectedItem.kind === 'card') {
		return {
			studyImageSrc: null,
			studyImageName: null,
			studyCardKey: selectedItem.id,
			studyCardValue: (await studyNamespace?.get(selectedItem.id)) ?? null,
			hasStudyCards: cardKeys.length > 0
		};
	}

	const object = await platform?.env.STARGATE_BUCKET?.get(selectedItem.id);
	if (object === null || object === undefined) {
		return {
			studyImageSrc: null,
			studyImageName: null,
			studyCardKey: null,
			studyCardValue: null,
			hasStudyCards: cardKeys.length > 0
		};
	}

	return {
		studyImageSrc: toDataUrl(object.httpMetadata?.contentType ?? 'image/jpeg', new Uint8Array(await object.arrayBuffer())),
		studyImageName: selectedItem.id,
		studyCardKey: null,
		studyCardValue: null,
		hasStudyCards: cardKeys.length > 0
	};
}

export const load: PageServerLoad = async ({ platform }) => {
	const emptyResponse = createEmptyResponse();
	emptyResponse.availableCategories = [...STUDY_CATEGORIES];
	emptyResponse.selectedCategory = DEFAULT_STUDY_CATEGORY;

	if (platform?.env.STARGATE_BUCKET === undefined) {
		return emptyResponse;
	}

	const indexObject = await platform.env.STARGATE_BUCKET.get(STUDY_INDEX_KEY);
	if (indexObject === null) {
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
		return emptyResponse;
	}

	const availableCategories = [...STUDY_CATEGORIES];

	const selectedCategory = DEFAULT_STUDY_CATEGORY;
	const studyItem = await loadRandomStudyItem(platform, selectedCategory, indexItems);

	return {
		...emptyResponse,
		...studyItem,
		availableCategories,
		selectedCategory
	};
};
