import { browser } from '$app/environment';
import type { FeedData } from './rss-service';

// Common configuration interface for RSS pages
export interface RSSPageConfig {
	LOADING_PLACEHOLDER_COUNT: number;
	CLIENT_CACHE_DURATION: number;
}

// Common page data interface
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

// Common client utilities for RSS pages
export class RSSPageUtils {
	private clientCache = new Map<string, { data: RSSPageData; timestamp: number; expires: number }>();

	constructor(private config: RSSPageConfig) {}

	// Common load more items logic
	createLoadMoreItems(data: RSSPageData, loadingMore: () => boolean, setLoadingMore: (loading: boolean) => void, additionalPages: () => number, setAdditionalPages: (pages: number) => void) {
		return () => {
			if (loadingMore()) return;

			// Check if we have more items to load
			const hasMoreItems = data.feeds && data.feeds.some((feed) => feed.success && feed.items && feed.items.length > 5 + additionalPages() * 5);

			if (!hasMoreItems) {
				console.log('No more items to load. additionalPages:', additionalPages());
				return;
			}

			setLoadingMore(true);
			console.log('Loading more items. Current additionalPages:', additionalPages());

			// Simulate loading delay for UX
			setTimeout(() => {
				setAdditionalPages(additionalPages() + 1);
				setLoadingMore(false);
				console.log('Loaded more items. New additionalPages:', additionalPages() + 1);
			}, 300);
		};
	}

	// Common auto-load content logic
	createCheckAndLoadContent(data: RSSPageData, loadingMore: () => boolean, additionalPages: () => number, loadMoreItems: () => void) {
		return () => {
			if (loadingMore() || !browser) return;

			setTimeout(() => {
				const windowHeight = window.innerHeight;
				const documentHeight = document.documentElement.scrollHeight;

				// If content doesn't fill the viewport and we have more items, load them
				if (documentHeight <= windowHeight + 100 && data.feeds && data.feeds.some((feed) => feed.success && feed.items && feed.items.length > 5 + additionalPages() * 5)) {
					loadMoreItems();
				}
			}, 200);
		};
	}

	// Common infinite scroll handler
	createHandleScroll(loadingMore: () => boolean, loadMoreItems: () => void) {
		return () => {
			if (loadingMore() || !browser) return;

			const scrollTop = window.scrollY;
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;

			// Trigger when within 200px of the bottom
			if (scrollTop + windowHeight >= documentHeight - 200) {
				loadMoreItems();
			}
		};
	}

	// Cache management
	cacheData(cacheKey: string, data: RSSPageData): void {
		if (data && !data.error && browser) {
			const timestamp = Date.now();
			this.clientCache.set(cacheKey, {
				data: { ...data },
				timestamp,
				expires: timestamp + this.config.CLIENT_CACHE_DURATION
			});

			// Cleanup old cache entries
			for (const [key, entry] of this.clientCache.entries()) {
				if (timestamp > entry.expires + this.config.CLIENT_CACHE_DURATION) {
					this.clientCache.delete(key);
				}
			}
		}
	}

	// Check cache
	getCachedData(cacheKey: string): RSSPageData | null {
		const cached = this.clientCache.get(cacheKey);
		if (cached && Date.now() < cached.expires) {
			console.log('Using client cache for key:', cacheKey);
			return cached.data;
		}
		return null;
	}

	// Common effect for setting up scroll listener
	createScrollEffect(handleScroll: () => void, checkAndLoadContent: () => void, additionalPages: () => number) {
		return () => {
			if (browser) {
				console.log('Setting up scroll listener. AdditionalPages:', additionalPages());
				window.addEventListener('scroll', handleScroll);

				// Delay auto-load check to ensure DOM is updated
				setTimeout(() => {
					checkAndLoadContent();
				}, 100);

				return () => window.removeEventListener('scroll', handleScroll);
			}
		};
	}

	// Generate loading placeholders array
	getLoadingPlaceholders(): number[] {
		return Array(this.config.LOADING_PLACEHOLDER_COUNT).fill(0);
	}
}
