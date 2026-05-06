import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Parser from 'rss-parser';
import type { BlogData, BlogConfig } from './types';
import { getOptimizedConfig } from './config';

// Get optimized configuration
const config = getOptimizedConfig();

// Custom parser with proper headers to avoid 403 errors
const requestHeaders = {
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
	Accept: 'application/rss+xml, application/xml, text/xml, */*',
	'Accept-Language': 'en-US,en;q=0.9',
	'Accept-Encoding': 'gzip, deflate, br',
	'Cache-Control': 'no-cache'
};

const parser = new Parser({
	requestOptions: {
		headers: requestHeaders,
		timeout: config.REQUEST_TIMEOUT
	}
});

// In-memory cache for blog data
interface CacheEntry {
	data: BlogData;
	timestamp: number;
	expires: number;
}

const blogCache = new Map<string, CacheEntry>();

// Rate limiting map to prevent too frequent requests
const requestLimiter = new Map<string, number>();

// Helper function to generate cache key
function getCacheKey(feedUrl: string): string {
	return `blog:${btoa(feedUrl)}`; // Use base64 encoding for safe key
}

// Helper function to check if cache entry is valid
function isCacheValid(entry: CacheEntry): boolean {
	return Date.now() < entry.expires;
}

// Helper function to check rate limiting
function isRateLimited(feedUrl: string): boolean {
	const lastRequest = requestLimiter.get(feedUrl);
	if (!lastRequest) return false;
	return Date.now() - lastRequest < config.MIN_REQUEST_INTERVAL;
}

// Helper function to update rate limiter
function updateRateLimit(feedUrl: string): void {
	requestLimiter.set(feedUrl, Date.now());
}

// Function to safely parse blog feeds with XML cleaning and caching
async function parseRSSFeed(url: string): Promise<any> {
	const cacheKey = getCacheKey(url);

	// Check cache first
	const cached = blogCache.get(cacheKey);
	if (cached && isCacheValid(cached)) {
		console.log(`Cache hit for ${url}`);
		return cached.data;
	}

	// Check rate limiting
	if (isRateLimited(url)) {
		console.log(`Rate limited for ${url}, using stale cache if available`);
		if (cached) {
			// Return stale cache if rate limited
			return cached.data;
		}
		throw new Error('Rate limited and no cached data available');
	}

	// Update rate limiter
	updateRateLimit(url);

	try {
		console.log(`Fetching fresh data for ${url}`);

		// Try direct parsing first
		let feed;
		try {
			feed = await parser.parseURL(url);
		} catch (error) {
			// If direct parsing fails, try manual fetch with cleaning
			console.log(`Direct parsing failed for ${url}, trying manual fetch...`);

			const response = await fetch(url, {
				headers: requestHeaders,
				signal: AbortSignal.timeout(config.REQUEST_TIMEOUT)
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
			feed = await parser.parseString(xmlContent);
		}

		// Limit items to reduce response size and processing
		if (feed.items && feed.items.length > config.MAX_ITEMS_PER_FEED) {
			feed.items = feed.items.slice(0, config.MAX_ITEMS_PER_FEED);
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

export const GET: RequestHandler = async ({ platform }) => {
	try {
		// Get blog configuration from environment variable
		const blogFeeds = platform?.env?.JOURNALS_FEEDS || (process.env.JOURNALS_FEEDS ? JSON.parse(process.env.JOURNALS_FEEDS) : null);

		if (!blogFeeds) {
			return json(
				{
					success: false,
					error: 'JOURNALS_FEEDS environment variable not found. Run with: wrangler pages dev'
				},
				{ status: 500 }
			);
		}

		let availableFeeds: BlogConfig[] = [];

		try {
			availableFeeds = Array.isArray(blogFeeds) ? blogFeeds : JSON.parse(blogFeeds);
		} catch (error) {
			console.error('Failed to parse JOURNALS_FEEDS:', error);
			return json(
				{
					success: false,
					error: 'Invalid blog configuration format'
				},
				{ status: 500 }
			);
		}

		// Fetch all blog feeds (no category filtering for journals)
		let results: BlogData[] = [];

		// Process feeds in batches to reduce load
		for (let i = 0; i < availableFeeds.length; i += config.BATCH_SIZE) {
			const batch = availableFeeds.slice(i, i + config.BATCH_SIZE);

			const batchPromises = batch.map(async ({ name, url }) => {
				const cacheKey = getCacheKey(url);

				try {
					const feed = await parseRSSFeed(url);

					const blogData: BlogData = {
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
								.slice(0, config.MAX_ITEMS_PER_FEED) || [] // Ensure max items limit
					};

					// Cache the successful result
					const timestamp = Date.now();
					blogCache.set(cacheKey, {
						data: blogData,
						timestamp,
						expires: timestamp + config.CACHE_DURATION
					});

					return blogData;
				} catch (error) {
					console.error(`Error parsing ${name} blog:`, error);
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
			if (i + config.BATCH_SIZE < availableFeeds.length) {
				await new Promise((resolve) => setTimeout(resolve, config.BATCH_DELAY));
			}
		}

		// Return processed blog data
		return json(
			{
				success: true,
				feeds: results,
				cacheInfo: {
					timestamp: Date.now(),
					cacheDuration: config.CACHE_DURATION
				}
			},
			{
				headers: {
					// Cache on client side for 5 minutes
					'Cache-Control': `public, max-age=${config.BROWSER_CACHE_MAX_AGE}, s-maxage=${config.BROWSER_CACHE_MAX_AGE}`,
					// Add ETag for conditional requests
					ETag: `W/"${Date.now()}-${results.length}"`,
					// Prevent caching errors
					Vary: 'Accept-Encoding'
				}
			}
		);
	} catch (error) {
		console.error('RSS parsing error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			},
			{
				status: 500,
				headers: {
					// Don't cache errors
					'Cache-Control': 'no-cache, no-store, must-revalidate'
				}
			}
		);
	}
};

// Cleanup old cache entries periodically
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of blogCache.entries()) {
		if (now > entry.expires + config.CACHE_DURATION * config.CLEANUP_MULTIPLIER) {
			blogCache.delete(key);
		}
	}
	// Also cleanup old rate limiter entries
	for (const [url, timestamp] of requestLimiter.entries()) {
		if (now - timestamp > config.MIN_REQUEST_INTERVAL * config.CLEANUP_RATE_LIMIT_MULTIPLIER) {
			requestLimiter.delete(url);
		}
	}
}, config.CACHE_DURATION); // Run cleanup every cache duration interval
