<script>
	import FeedItem from './feed-item.svelte';

	const { feeds, additionalPages = 0, loadingPlaceholderCount = 5 } = $props();
</script>

<!-- Initial items (first 5 from each feed) -->
{#each feeds as feed}
	{#if feed.success && feed.items}
		{#each feed.items.slice(0, 5) as item}
			<FeedItem {item} feedName={feed.name} />
		{/each}
	{:else}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			<strong>Error loading {feed.name}:</strong>
			{feed.error || 'Unknown error'}
		</div>
	{/if}
{/each}

<!-- Additional items (shown after clicking Load More) -->
{#if additionalPages > 0}
	{#each Array(additionalPages).fill(0) as _, pageIndex}
		{@const startIndex = 5 + pageIndex * 5}
		{@const endIndex = startIndex + 5}
		{#each feeds as feed}
			{#if feed.success && feed.items && feed.items.length > startIndex}
				{#each feed.items.slice(startIndex, endIndex) as item}
					<FeedItem {item} feedName={feed.name} />
				{/each}
			{/if}
		{/each}
	{/each}
{/if}
