<script lang="ts">
	import FeedItem from './feed-item.svelte';
	import type { FeedData, FeedItem as RSSFeedItem } from './rss-service';
	import { browser } from '$app/environment';
	import { fly, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	interface FeedItemWithSource extends RSSFeedItem {
		feedName: string;
	}

	const { feeds, initialLimit, loadMoreIncrement }: { feeds: FeedData[]; initialLimit?: number; loadMoreIncrement?: number } = $props();

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

	// Apply initial limit if specified
	let itemsToShow = $state(0); // Start with 0 to trigger transition for initial items
	let previousItemsCount = $state(0); // Track previous count for new item transitions
	const displayItems = $derived(allItems.slice(0, itemsToShow));

	// Set initial items with delay to trigger transitions
	$effect(() => {
		if (browser) {
			setTimeout(() => {
				itemsToShow = initialLimit || allItems.length;
			}, 50);
		} else {
			itemsToShow = initialLimit || allItems.length;
		}
	});

	// Reset items to show when feeds change
	$effect(() => {
		previousItemsCount = 0;
		itemsToShow = 0; // Reset to 0 first
		setTimeout(() => {
			itemsToShow = initialLimit || allItems.length;
		}, 50);
	});

	// Track previous items count for smooth new item transitions
	$effect(() => {
		if (itemsToShow > previousItemsCount && previousItemsCount > 0) {
			// New items are being added via infinite scroll
			setTimeout(() => {
				previousItemsCount = itemsToShow;
			}, 100);
		} else if (previousItemsCount === 0) {
			// Initial load completed
			setTimeout(() => {
				previousItemsCount = itemsToShow;
			}, 1000);
		}
	});

	// Infinite scroll functionality
	$effect(() => {
		if (!browser || !initialLimit || !loadMoreIncrement) return;

		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;

			// If content fits on screen without scrolling, load more immediately
			if (documentHeight <= windowHeight && itemsToShow < allItems.length) {
				itemsToShow = Math.min(itemsToShow + loadMoreIncrement, allItems.length);
				return;
			}

			// Load more when scrolled to 90% of the page (more aggressive for desktop)
			if (scrollTop + windowHeight >= documentHeight * 0.9) {
				if (itemsToShow < allItems.length) {
					itemsToShow = Math.min(itemsToShow + loadMoreIncrement, allItems.length);
				}
			}
		};

		// Check immediately if content fits on screen
		setTimeout(handleScroll, 100);

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
		};
	});
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
{#each displayItems as item, index (item.link || item.title || index)}
	{@const isNewlyLoaded = index >= previousItemsCount && previousItemsCount > 0}
	{@const delay = isNewlyLoaded ? Math.min((index - previousItemsCount) * 100, 800) : Math.min(index * 100, 800)}
	<div in:fly={{ y: 30, duration: 600, delay, easing: quintOut }} out:fade={{ duration: 200 }}>
		<FeedItem {item} feedName={item.feedName} />
	</div>
{/each}

<!-- Show count info if limited -->
{#if initialLimit && allItems.length > itemsToShow}
	<div class="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
		Showing {displayItems.length} of {allItems.length} items • Scroll for more
	</div>
{:else if initialLimit && allItems.length > initialLimit && itemsToShow >= allItems.length}
	<div class="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
		Showing all {allItems.length} items
	</div>
{/if}
