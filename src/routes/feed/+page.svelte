<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SHARED_STYLES } from '$lib/shared-styles';
	import { browser } from '$app/environment';
	import { FEED_CONFIG } from './config';

	let { data }: { data: PageData } = $props();

	let selectedCategory = $state('');
	let loading = $state(false);

	// Client-side cache to avoid redundant requests
	const clientCache = new Map<string, { data: PageData; timestamp: number; expires: number }>();

	// Update selectedCategory when data changes
	$effect(() => {
		selectedCategory = data.selectedCategories?.[0] || '';
		loading = false;
	});

	// Debounced category change to prevent rapid requests
	let categoryChangeTimeout: ReturnType<typeof setTimeout> | undefined;

	function handleCategoryToggle(categoryName: string) {
		// If clicking the same category, deselect it; otherwise select the new one
		const newCategory = selectedCategory === categoryName ? '' : categoryName;
		selectedCategory = newCategory;

		// Clear any pending category change
		if (categoryChangeTimeout) {
			clearTimeout(categoryChangeTimeout);
		}

		// Check client cache first
		const cacheKey = newCategory || 'none';
		const cached = clientCache.get(cacheKey);
		if (cached && Date.now() < cached.expires) {
			console.log('Using client cache for category:', cacheKey);
			data = cached.data;
			return;
		}

		// Show loading immediately for non-cached requests
		if (newCategory) {
			loading = true;
		}

		// Debounce the actual navigation to prevent rapid requests
		categoryChangeTimeout = setTimeout(() => {
			const url = new URL(page.url);

			if (newCategory) {
				url.searchParams.set('categories', newCategory);
			} else {
				url.searchParams.delete('categories');
			}

			goto(url.toString());
		}, FEED_CONFIG.CATEGORY_CHANGE_DEBOUNCE);
	}

	// Cache successful data loads
	$effect(() => {
		if (data && !data.error && browser) {
			const cacheKey = selectedCategory || 'none';
			const timestamp = Date.now();
			clientCache.set(cacheKey, {
				data: { ...data },
				timestamp,
				expires: timestamp + FEED_CONFIG.CLIENT_CACHE_DURATION
			});

			// Cleanup old cache entries
			for (const [key, entry] of clientCache.entries()) {
				if (timestamp > entry.expires + FEED_CONFIG.CLIENT_CACHE_DURATION) {
					clientCache.delete(key);
				}
			}
		}
	});
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
							class="chip {selectedCategory === categoryName ? 'bg-primary-500 text-white border-primary-500' : 'bg-transparent text-primary-500 border-primary-500'} border px-3 py-1 rounded-full text-sm transition-colors"
						>
							{categoryName}
						</button>
					{/each}
				</div>

				<!-- Cache status indicator -->
				{#if data.cacheInfo && selectedCategory}
					<div class="flex items-center gap-2 text-xs text-gray-500">
						<span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
					</div>
				{/if}
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
			{#each Array(FEED_CONFIG.LOADING_PLACEHOLDER_COUNT) as _}
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
						class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-2 hover:shadow-md hover:bg-gray-50/800 dark:hover:bg-gray-800/50 transition-shadow cursor-pointer"
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
						<div class="flex items-start justify-between gap-3">
							<h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed flex-1 min-w-0">
								{item.title}
							</h3>
							<div class="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
								<span class={`${SHARED_STYLES.badge} ${SHARED_STYLES.badgeSource}`}>
									{feed.name}
								</span>
								{#if item.pubDate}
									<span class={`${SHARED_STYLES.badge} ${SHARED_STYLES.badgeDate}`}>
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
