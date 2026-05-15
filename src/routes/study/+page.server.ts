import type { PageServerLoad } from './$types';

const STUDY_PREFIX = 'study/';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

function isStudyImageKey(key: string) {
	return IMAGE_EXTENSIONS.some((extension) => key.toLowerCase().endsWith(extension));
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
		return { studyImageSrc: null, studyImageName: null, studyImageNames: [] };
	}

	const imageNames: string[] = [];
	let cursor: string | undefined;

	do {
		const listing = await platform.env.STARGATE_BUCKET.list({
			prefix: STUDY_PREFIX,
			cursor
		});

		for (const object of listing.objects) {
			if (isStudyImageKey(object.key)) {
				imageNames.push(object.key);
			}
		}

		cursor = listing.truncated ? listing.cursor : undefined;
	} while (cursor);

	if (imageNames.length === 0) {
		return { studyImageSrc: null, studyImageName: null, studyImageNames: [] };
	}

	const requestedImageName = url.searchParams.get('image') || undefined;
	const studyImageName = imageNames.includes(requestedImageName ?? '') ? requestedImageName : (pickRandomItem(imageNames) ?? imageNames[0]);

	if (!studyImageName) {
		return { studyImageSrc: null, studyImageName: null, studyImageNames: imageNames };
	}

	const object = await platform.env.STARGATE_BUCKET.get(studyImageName);
	if (object === null) {
		return { studyImageSrc: null, studyImageName: null, studyImageNames: imageNames };
	}

	return {
		studyImageSrc: toDataUrl(object.httpMetadata?.contentType ?? 'image/jpeg', new Uint8Array(await object.arrayBuffer())),
		studyImageName,
		studyImageNames: imageNames
	};
};
