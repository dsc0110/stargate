// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

export interface RSSConfig {
	// Cache settings
	CACHE_DURATION: number; // milliseconds
	CLIENT_CACHE_DURATION: number; // milliseconds

	// Rate limiting
	MIN_REQUEST_INTERVAL: number; // milliseconds

	// Request settings
	REQUEST_TIMEOUT: number; // milliseconds
	MAX_ITEMS_PER_FEED: number;
	BATCH_SIZE: number;
	BATCH_DELAY: number; // milliseconds

	// HTTP cache headers
	BROWSER_CACHE_MAX_AGE: number; // seconds

	// Cleanup intervals
	CLEANUP_MULTIPLIER: number;
	CLEANUP_RATE_LIMIT_MULTIPLIER: number;
}

export interface FeedConfig {
	name: string;
	url: string;
	category: string;
	enabled?: boolean;
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
	categoryFeeds?: Record<string, string[]>; // Maps category name to array of feed source names
	error?: string;
	cacheInfo?: {
		timestamp: number;
		cacheDuration: number;
	};
}
