<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
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
		const url = new URL($page.url);

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
							class="chip {selectedFeeds.has(feedName) ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300 px-3 py-1 rounded-full text-sm transition-colors"
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
						<article class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
							<div class="flex items-start gap-3">
								<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded shrink-0">{feed.name}</span>
								<div class="flex-1">
									<h3 class="text-lg font-medium text-blue-600 hover:text-blue-800">
										<a href={item.link} target="_blank" rel="noopener noreferrer">
											{item.title}
										</a>
									</h3>

									{#if item.contentSnippet}
										<p class="text-gray-700 mt-2 line-clamp-3">{item.contentSnippet}</p>
									{/if}

									{#if item.pubDate}
										<time class="text-sm text-gray-500 mt-2 block">
											{new Date(item.pubDate).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
												day: 'numeric'
											})}
										</time>
									{/if}
								</div>
							</div>
						</article>
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
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<span class="ml-3 text-gray-600">Loading feeds...</span>
		</div>
	{/if}
</article>
