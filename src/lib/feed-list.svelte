<script lang="ts">
	import FeedItem from './feed-item.svelte';
	import type { FeedData, FeedItem as RSSFeedItem } from './rss-service';

	interface FeedItemWithSource extends RSSFeedItem {
		feedName: string;
	}

	const { feeds }: { feeds: FeedData[] } = $props();

	// Get all items sorted by date - reactive to feeds changes
	const allItems = $derived(
		(() => {
			const items: FeedItemWithSource[] = [];

			if (feeds && Array.isArray(feeds)) {
				feeds.forEach((feed) => {
					if (feed.success && feed.items && Array.isArray(feed.items)) {
						feed.items.forEach((item: RSSFeedItem) => {
							items.push({ ...item, feedName: feed.name });
						});
					}
				});

				// Sort by date (newest first)
				items.sort((a, b) => {
					const dateA = new Date(a.pubDate || 0);
					const dateB = new Date(b.pubDate || 0);
					return dateB.getTime() - dateA.getTime();
				});
			}

			return items;
		})()
	);
</script>

<!-- Error messages for failed feeds -->
{#each feeds as feed}
	{#if !feed.success}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			<strong>Error loading {feed.name}:</strong>
			{feed.error || 'Unknown error'}
		</div>
	{/if}
{/each}

<!-- Display all items sorted by date -->
{#each allItems as item}
	<FeedItem {item} feedName={item.feedName} />
{/each}
