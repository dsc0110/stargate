import type { FeedData } from './rss-service';

// Common page data interface for RSS pages
export interface RSSPageData {
	feeds?: FeedData[];
	error?: string;
	cacheInfo?: {
		timestamp: number;
		cacheDuration: number;
	};
	// News-specific
	availableCategories?: string[];
	selectedCategories?: string[];
}
