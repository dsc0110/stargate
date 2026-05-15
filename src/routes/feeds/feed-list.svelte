<script lang="ts">
	import FeedItem from './feed-item.svelte';
	import type { FeedData, FeedItem as RSSFeedItem } from './types';
	import { fade } from 'svelte/transition';

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

<!-- Display items sorted by date -->
{#each allItems as item, index (`${index}-${item.feedName}-${item.link || item.title}`)}
	<div class="feed-enter" style={`animation-delay: ${220 + index * 90}ms`} out:fade={{ duration: 200 }}>
		<FeedItem {item} feedName={item.feedName} />
	</div>
{/each}

<style>
	.feed-enter {
		animation: feed-enter 1200ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	@keyframes feed-enter {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
