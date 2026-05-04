// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

export interface FeedConfig {
	name: string;
	url: string;
	category: string;
}

export interface FeedItem {
	title: string;
	link: string;
	pubDate?: string;
	contentSnippet?: string;
}

export interface FeedData {
	name: string;
	success: boolean;
	title?: string;
	description?: string;
	items?: FeedItem[];
	error?: string;
}

export interface MultipleFeedResponse {
	success: boolean;
	feeds?: FeedData[];
	availableCategories?: string[];
	error?: string;
	cacheInfo?: {
		timestamp: number;
		cacheDuration: number;
	};
}

export interface PageData {
	feeds?: FeedData[];
	availableCategories?: string[];
	selectedCategories?: string[];
	error?: string;
	cacheInfo?: {
		timestamp: number;
		cacheDuration: number;
	};
}

export interface PageServerLoad {
	(event: Parameters<import('./$types').PageServerLoad>[0]): Promise<PageData> | PageData;
}
