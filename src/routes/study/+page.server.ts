import type { PageServerLoad } from './$types';

const STUDY_PREFIX = 'study/';
const STUDY_INDEX_KEY = `${STUDY_PREFIX}index.json`;
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

type StudyIndexItem = {
	filename: string;
	category?: string;
	timestamp?: string;
};

type StudyPageResponse = {
	studyImageSrc: string | null;
	studyImageName: string | null;
	studyImageNames: string[];
	availableCategories: string[];
	selectedCategory: string;
};

function isStudyImageKey(key: string) {
	return IMAGE_EXTENSIONS.some((extension) => key.toLowerCase().endsWith(extension));
}

function toStudyImageKey(filename: string) {
	const normalized = filename.trim().replace(/^\/+/, '');
	return `${STUDY_PREFIX}${normalized}`;
}

function createEmptyResponse(): StudyPageResponse {
	return {
		studyImageSrc: null,
		studyImageName: null,
		studyImageNames: [],
		availableCategories: [],
		selectedCategory: ''
	};
}

function pickRandomItem(items: string[], exclude?: string) {
	const candidates = exclude ? items.filter((item) => item !== exclude) : items;
	if (candidates.length === 0) {
		return null;
	}

	return candidates[Math.floor(Math.random() * candidates.length)];
}

function toDataUrl(contentType: string, bytes: Uint8Array) {
	let binary = '';
	const chunkSize = 0x8000;

	for (let index = 0; index < bytes.length; index += chunkSize) {
		binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
	}

	return `data:${contentType};base64,${btoa(binary)}`;
}

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

	const requestedCategory = url.searchParams.get('category')?.trim() ?? '';
	const selectedCategory = availableCategories.includes(requestedCategory) ? requestedCategory : (availableCategories[0] ?? '');

	const filteredItems = selectedCategory ? indexItems.filter((item) => item.category?.trim() === selectedCategory) : indexItems;
	const imageNames = filteredItems.map((item) => toStudyImageKey(item.filename));

	if (imageNames.length === 0) {
		return {
			...createEmptyResponse(),
			availableCategories,
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
			selectedCategory
		};
	}

	return {
		studyImageSrc: toDataUrl(object.httpMetadata?.contentType ?? 'image/jpeg', new Uint8Array(await object.arrayBuffer())),
		studyImageName,
		studyImageNames: imageNames,
		availableCategories,
		selectedCategory
	};
};
