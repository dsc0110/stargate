// Feed optimization configuration
export const FEED_CONFIG = {
	// Cache settings
	CACHE_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
	CLIENT_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes client-side cache

	// Rate limiting
	MIN_REQUEST_INTERVAL: 30 * 1000, // 30 seconds minimum between requests per feed

	// Request settings
	REQUEST_TIMEOUT: 10000, // 10 second timeout
	MAX_ITEMS_PER_FEED: 5, // Limit items to reduce response size
	BATCH_SIZE: 3, // Process feeds in batches of 3
	BATCH_DELAY: 100, // Small delay between batches (milliseconds)

	// UI settings
	CATEGORY_CHANGE_DEBOUNCE: 300, // Debounce category changes (milliseconds)
	LOADING_PLACEHOLDER_COUNT: 5, // Number of loading placeholders to show

	// HTTP cache headers
	BROWSER_CACHE_MAX_AGE: 300, // 5 minutes browser cache

	// Cleanup intervals
	CLEANUP_MULTIPLIER: 2, // Keep cache entries this many times longer than cache duration
	CLEANUP_RATE_LIMIT_MULTIPLIER: 10 // Keep rate limiter entries this many times longer
} as const;

// Helper function to get environment-specific overrides
export function getOptimizedConfig() {
	// You can override these values based on environment variables
	// For example, longer cache in production, shorter in development
	const isProd = process.env.NODE_ENV === 'production';

	return {
		...FEED_CONFIG,
		// Longer cache in production
		CACHE_DURATION: isProd ? FEED_CONFIG.CACHE_DURATION : FEED_CONFIG.CACHE_DURATION / 3,
		// More aggressive batching in production
		BATCH_SIZE: isProd ? FEED_CONFIG.BATCH_SIZE : 2
	};
}
