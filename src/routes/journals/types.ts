// Blog types

export interface BlogConfig {
	name: string;
	url: string;
}

export interface BlogItem {
	title: string;
	link: string;
	pubDate?: string;
	contentSnippet?: string;
}

export interface BlogData {
	name: string;
	success: boolean;
	title?: string;
	description?: string;
	items?: BlogItem[];
	error?: string;
}

export interface BlogFeedResponse {
	success: boolean;
	feeds?: BlogData[];
	error?: string;
	cacheInfo?: {
		timestamp: number;
		cacheDuration: number;
	};
}

export interface PageData {
	feeds?: BlogData[];
	error?: string;
	cacheInfo?: {
		timestamp: number;
		cacheDuration: number;
	};
}

export interface PageServerLoad {
	(event: Parameters<import('./$types').PageServerLoad>[0]): Promise<PageData> | PageData;
}
