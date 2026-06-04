import type { StudyPageResponse } from './types';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

export const STUDY_PREFIX = 'study/';
export const STUDY_INDEX_KEY = `${STUDY_PREFIX}index.json`;

export function isStudyImageKey(key: string) {
	return IMAGE_EXTENSIONS.some((extension) => key.toLowerCase().endsWith(extension));
}

export function toStudyImageKey(filename: string) {
	const normalized = filename.trim().replace(/^\/+/, '');
	return `${STUDY_PREFIX}${normalized}`;
}

export function createEmptyResponse(): StudyPageResponse {
	return {
		studyImageSrc: null,
		studyImageName: null,
		studyCardKey: null,
		studyCardValue: null,
		hasStudyCards: false,
		availableCategories: [],
		selectedCategory: ''
	};
}

export function pickRandomItem(items: string[], exclude?: string) {
	const candidates = exclude ? items.filter((item) => item !== exclude) : items;
	if (candidates.length === 0) {
		return null;
	}

	return candidates[Math.floor(Math.random() * candidates.length)];
}

export function toDataUrl(contentType: string, bytes: Uint8Array) {
	let binary = '';
	const chunkSize = 0x8000;

	for (let index = 0; index < bytes.length; index += chunkSize) {
		binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
	}

	return `data:${contentType};base64,${btoa(binary)}`;
}
