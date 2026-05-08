import Parser from 'rss-parser';
import type { FeedConfig, FeedData, RSSConfig } from './types';

// Custom parser with proper headers to avoid 403 errors
const requestHeaders = {
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
	Accept: 'application/rss+xml, application/xml, text/xml, */*',
	'Accept-Language': 'en-US,en;q=0.9',
	'Accept-Encoding': 'gzip, deflate, br',
	'Cache-Control': 'no-cache'
};

// In-memory cache for feed data
interface CacheEntry {
	data: FeedData;
	timestamp: number;
	expires: number;
}

// Rate limiting map to prevent too frequent requests
const requestLimiter = new Map<string, number>();

// Shared RSS service class
export class RSSService {
	private feedCache = new Map<string, CacheEntry>();
	private parser: Parser;
	private config: RSSConfig;
	private cleanupInterval?: ReturnType<typeof setInterval>;

	constructor(config: RSSConfig) {
		this.config = config;
		this.parser = new Parser({
			requestOptions: {
				headers: requestHeaders,
				timeout: config.REQUEST_TIMEOUT
			}
		});

		// Start cleanup interval
		this.startCleanup();
	}

	// Helper function to generate cache key
	private getCacheKey(feedUrl: string, prefix = 'rss'): string {
		return `${prefix}:${btoa(feedUrl)}`; // Use base64 encoding for safe key
	}

	// Helper function to check if cache entry is valid
	private isCacheValid(entry: CacheEntry): boolean {
		return Date.now() < entry.expires;
	}

	// Helper function to check rate limiting
	private isRateLimited(feedUrl: string): boolean {
		const lastRequest = requestLimiter.get(feedUrl);
		if (!lastRequest) return false;
		return Date.now() - lastRequest < this.config.MIN_REQUEST_INTERVAL;
	}

	// Helper function to update rate limiter
	private updateRateLimit(feedUrl: string): void {
		requestLimiter.set(feedUrl, Date.now());
	}

	// Function to safely parse feeds with XML cleaning and caching
	async parseRSSFeed(url: string, cachePrefix = 'rss'): Promise<any> {
		const cacheKey = this.getCacheKey(url, cachePrefix);

		// Check cache first
		const cached = this.feedCache.get(cacheKey);
		if (cached && this.isCacheValid(cached)) {
			console.log(`Cache hit for ${url}`);
			return cached.data;
		}

		// Check rate limiting
		if (this.isRateLimited(url)) {
			console.log(`Rate limited for ${url}, using stale cache if available`);
			if (cached) {
				// Return stale cache if rate limited
				return cached.data;
			}
			throw new Error('Rate limited and no cached data available');
		}

		// Update rate limiter
		this.updateRateLimit(url);

		try {
			console.log(`Fetching fresh data for ${url}`);

			// Try direct parsing first
			let feed;
			try {
				feed = await this.parser.parseURL(url);
			} catch (error) {
				// If direct parsing fails, try manual fetch with cleaning
				console.log(`Direct parsing failed for ${url}, trying manual fetch...`);

				const response = await fetch(url, {
					headers: requestHeaders,
					signal: AbortSignal.timeout(this.config.REQUEST_TIMEOUT)
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				let xmlContent = await response.text();

				// Clean common XML issues
				xmlContent = xmlContent.replace(/^\uFEFF/, ''); // Remove UTF-8 BOM
				xmlContent = xmlContent.replace(/^[^\<]*\</, '<'); // Remove any chars before first tag
				xmlContent = xmlContent.trim();

				// Parse the cleaned content
				feed = await this.parser.parseString(xmlContent);
			}

			// Limit items to reduce response size and processing
			if (feed.items && feed.items.length > this.config.MAX_ITEMS_PER_FEED) {
				feed.items = feed.items.slice(0, this.config.MAX_ITEMS_PER_FEED);
			}

			return feed;
		} catch (error) {
			console.error(`Error fetching ${url}:`, error);
			// If we have stale cache, use it as fallback
			if (cached) {
				console.log(`Using stale cache for ${url} due to fetch error`);
				return cached.data;
			}
			throw error;
		}
	}

	// Process multiple feeds in batches
	async processFeeds(feeds: FeedConfig[], cachePrefix = 'rss', categoryFilter?: string[]): Promise<FeedData[]> {
		// Filter feeds by category if specified
		let feedsToFetch = feeds;
		if (categoryFilter && categoryFilter.length > 0) {
			feedsToFetch = feeds.filter((feed) => feed.category && categoryFilter.includes(feed.category));
		}

		let results: FeedData[] = [];

		// Process feeds in batches to reduce load
		for (let i = 0; i < feedsToFetch.length; i += this.config.BATCH_SIZE) {
			const batch = feedsToFetch.slice(i, i + this.config.BATCH_SIZE);

			const batchPromises = batch.map(async ({ name, url }) => {
				const cacheKey = this.getCacheKey(url, cachePrefix);

				try {
					const feed = await this.parseRSSFeed(url, cachePrefix);

					const feedData: FeedData = {
						name,
						success: true,
						title: feed.title,
						description: feed.description,
						items:
							feed.items
								?.map((item: any) => ({
									title: item.title || 'Untitled',
									link: item.link,
									pubDate: item.pubDate,
									contentSnippet: item.contentSnippet || item.content?.substring(0, 150)
								}))
								.slice(0, this.config.MAX_ITEMS_PER_FEED) || [] // Ensure max items limit
					};

					// Cache the successful result
					const timestamp = Date.now();
					this.feedCache.set(cacheKey, {
						data: feedData,
						timestamp,
						expires: timestamp + this.config.CACHE_DURATION
					});

					return feedData;
				} catch (error) {
					console.error(`Error parsing ${name} feed:`, error);
					return {
						name,
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error occurred'
					};
				}
			});

			const batchResults = await Promise.all(batchPromises);
			results.push(...batchResults);

			// Small delay between batches to be nice to external servers
			if (i + this.config.BATCH_SIZE < feedsToFetch.length) {
				await new Promise((resolve) => setTimeout(resolve, this.config.BATCH_DELAY));
			}
		}

		return results;
	}

	// Get HTTP response headers for caching
	getResponseHeaders(resultsLength: number): Record<string, string> {
		return {
			// Cache on client side
			'Cache-Control': `public, max-age=${this.config.BROWSER_CACHE_MAX_AGE}, s-maxage=${this.config.BROWSER_CACHE_MAX_AGE}`,
			// Add ETag for conditional requests
			ETag: `W/"${Date.now()}-${resultsLength}"`,
			// Prevent caching errors
			Vary: 'Accept-Encoding'
		};
	}

	// Start cleanup process
	private startCleanup(): void {
		this.cleanupInterval = setInterval(() => {
			const now = Date.now();

			// Cleanup old cache entries
			for (const [key, entry] of this.feedCache.entries()) {
				if (now > entry.expires + this.config.CACHE_DURATION * this.config.CLEANUP_MULTIPLIER) {
					this.feedCache.delete(key);
				}
			}

			// Cleanup old rate limiter entries
			for (const [url, timestamp] of requestLimiter.entries()) {
				if (now - timestamp > this.config.MIN_REQUEST_INTERVAL * this.config.CLEANUP_RATE_LIMIT_MULTIPLIER) {
					requestLimiter.delete(url);
				}
			}
		}, this.config.CACHE_DURATION);
	}
}
