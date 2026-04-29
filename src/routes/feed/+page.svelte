<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SHARED_STYLES } from '$lib/shared-styles';

	export let data: PageData;

	let selectedFeeds = new Set(data.selectedFeeds || []);

	function handleFeedToggle(feedName: string) {
		if (selectedFeeds.has(feedName)) {
			selectedFeeds.delete(feedName);
		} else {
			selectedFeeds.add(feedName);
		}
		selectedFeeds = selectedFeeds; // Trigger reactivity

		// Auto-apply selection
		const feedsParam = Array.from(selectedFeeds).join(',');
		const url = new URL(page.url);

		if (feedsParam) {
			url.searchParams.set('feeds', feedsParam);
		} else {
			url.searchParams.delete('feeds');
		}

		goto(url.toString());
	}
</script>

<svelte:head>
	<title>RSS Feed</title>
	<meta name="description" content="RSS feed display" />
</svelte:head>

<div id="subheader">
	<!-- Controls Section -->
	{#if data.availableFeeds && data.availableFeeds.length > 0}
		<div class={SHARED_STYLES.controlsContainer}>
			<div class="flex justify-between items-center">
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium text-gray-800 dark:text-gray-200">Select Feeds:</span>
					{#each data.availableFeeds as feedName}
						<button
							on:click={() => handleFeedToggle(feedName)}
							class="chip {selectedFeeds.has(feedName) ? 'bg-primary-500 text-white border-primary-500' : 'bg-transparent text-primary-500 border-primary-500 hover:bg-primary-50'} border px-3 py-1 rounded-full text-sm transition-colors"
						>
							{feedName}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<article class="min-h-[512px] p-4">
	{#if data.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			<strong>Error:</strong>
			{data.error}
		</div>
	{:else if data.feeds && selectedFeeds.size > 0}
		<div class="space-y-4">
			{#each data.feeds as feed}
				{#if feed.success && feed.items}
					{#each feed.items.slice(0, 5) as item}
						<div
							class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-shadow cursor-pointer"
							on:click={() => window.open(item.link, '_blank')}
							on:keydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									window.open(item.link, '_blank');
								}
							}}
							tabindex="0"
							role="button"
							aria-label="Open {item.title} in new tab"
						>
							<div class="py-2">
								<h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
									{item.title}
								</h3>
								<div class="flex items-center gap-2 mt-2">
									<span class="text-xs bg-transparent text-secondary-600 dark:text-secondary-400 border border-secondary-300 dark:border-secondary-600 px-2 py-1 rounded-full">{feed.name}</span>
									{#if item.pubDate}
										<span class="text-xs bg-transparent text-secondary-600 dark:text-secondary-400 border border-secondary-300 dark:border-secondary-600 px-2 py-1 rounded-full">
											{new Date(item.pubDate).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric'
											})}
										</span>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				{:else}
					<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
						<strong>Error loading {feed.name}:</strong>
						{feed.error || 'Unknown error'}
					</div>
				{/if}
			{/each}
		</div>
	{:else if selectedFeeds.size === 0}{:else}
		<div class="flex items-center justify-center h-64">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
			<span class="ml-3 text-gray-600">Loading feeds...</span>
		</div>
	{/if}
</article>
