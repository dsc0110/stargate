<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SHARED_STYLES } from '$lib/shared-styles';

	let { data }: { data: PageData } = $props();

	let selectedCategory = $state('');
	let loading = $state(false);

	// Update selectedCategory when data changes
	$effect(() => {
		selectedCategory = data.selectedCategories?.[0] || '';
		loading = false;
	});

	function handleCategoryToggle(categoryName: string) {
		// If clicking the same category, deselect it; otherwise select the new one
		selectedCategory = selectedCategory === categoryName ? '' : categoryName;

		// Show loading immediately
		if (selectedCategory) {
			loading = true;
		}

		// Auto-apply selection
		const url = new URL(page.url);

		if (selectedCategory) {
			url.searchParams.set('categories', selectedCategory);
		} else {
			url.searchParams.delete('categories');
		}

		goto(url.toString());
	}
</script>

<svelte:head>
	<title>feed</title>
	<meta name="description" content="feed" />
</svelte:head>

<div id="subheader">
	<!-- Controls Section -->
	{#if data.availableCategories && data.availableCategories.length > 0}
		<div class={SHARED_STYLES.controlsContainer}>
			<div class="flex justify-between items-center">
				<div class="flex items-center gap-2">
					{#each data.availableCategories as categoryName}
						<button
							onclick={() => handleCategoryToggle(categoryName)}
							class="chip {selectedCategory === categoryName ? 'bg-primary-500 text-white border-primary-500' : 'bg-transparent text-primary-500 border-primary-500 hover:bg-primary-50'} border px-3 py-1 rounded-full text-sm transition-colors"
						>
							{categoryName}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<div id="feeditems" class="py-4">
	{#if data.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			<strong>Error:</strong>
			{data.error}
		</div>
	{:else if loading}
		<!-- Loading placeholders -->
		<div class="space-y-4">
			{#each Array(5) as _}
				<div class="placeholder animate-pulse border border-gray-200 dark:border-gray-700 rounded-lg p-2">
					<div class="py-2">
						<div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
						<div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else if data.feeds && selectedCategory}
		{#each data.feeds as feed}
			{#if feed.success && feed.items}
				{#each feed.items.slice(0, 5) as item}
					<div
						id="feeditem"
						class="border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-2 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-shadow cursor-pointer"
						onclick={() => window.open(item.link, '_blank')}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								window.open(item.link, '_blank');
							}
						}}
						tabindex="0"
						role="button"
						aria-label="Open {item.title} in new tab"
					>
						<h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
							{item.title}
						</h3>
						<div class="mt-1">
							<span class="text-xs text-secondary-600 dark:text-secondary-400">
								{feed.name}{#if item.pubDate}, {new Date(item.pubDate).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric'
									})}{/if}
							</span>
						</div>
					</div>
				{/each}
			{:else}
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<strong>Error loading {feed.name}:</strong>
					{feed.error || 'Unknown error'}
				</div>
			{/if}
		{/each}
	{:else if !selectedCategory}
		<!-- Show nothing when no category selected -->
	{/if}
</div>
