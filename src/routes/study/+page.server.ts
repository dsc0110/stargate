import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (platform?.env.STARGATE_BUCKET === undefined) {
		return { studyImageSrc: null };
	}

	const object = await platform.env.STARGATE_BUCKET.get('study/study.jpg');
	if (object === null) {
		return { studyImageSrc: null };
	}

	const contentType = object.httpMetadata?.contentType ?? 'image/jpeg';
	const bytes = new Uint8Array(await object.arrayBuffer());
	const base64 = Buffer.from(bytes).toString('base64');

	return {
		studyImageSrc: `data:${contentType};base64,${base64}`
	};
};
