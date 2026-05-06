<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SHARED_STYLES, getChipClasses } from '$lib/shared-styles';
	import { browser } from '$app/environment';
	import { FEED_CONFIG } from './config';

	let { data }: { data: PageData } = $props();

	let selectedCategory = $state('');
	let loading = $state(false);
	let loadingMore = $state(false);
	let additionalPages = $state(0); // Track how many additional pages loaded
	let hasAutoSelected = $state(false); // Track if we've already auto-selected
	let isDropdownOpen = $state(false);

	// Available categories for dropdown
	const availableCategories = $derived(data.availableCategories || []);

	// Toggle category selection (single selection only)
	const selectCategory = (categoryName: string) => {
		const newCategory = selectedCategory === categoryName ? '' : categoryName;
		selectedCategory = newCategory;
		isDropdownOpen = false;

		// Clear timeout and update URL after a delay to prevent rapid requests
		clearTimeout(categoryChangeTimeout);
		loading = true;

		categoryChangeTimeout = setTimeout(() => {
			console.log('Debounced category change to:', newCategory);

			// Update URL with the new category parameter
			const url = new URL(page.url);
			if (newCategory) {
				url.searchParams.set('categories', newCategory);
			}

			goto(url.toString());
		}, 300);
	};

	// Close dropdown when clicking outside
	const handleOutsideClick = (event: Event) => {
		const target = event.target as Element;
		if (!target.closest('.dropdown-container')) {
			isDropdownOpen = false;
		}
	};

	// Add/remove event listener for outside clicks
	$effect(() => {
		if (isDropdownOpen) {
			document.addEventListener('click', handleOutsideClick);
		} else {
			document.removeEventListener('click', handleOutsideClick);
		}

		return () => {
			document.removeEventListener('click', handleOutsideClick);
		};
	});

	// Client-side cache to avoid redundant requests
	const clientCache = new Map<string, { data: PageData; timestamp: number; expires: number }>();

	// Update selectedCategory when data changes
	$effect(() => {
		const newSelectedCategory = data.selectedCategories?.[0] || '';
		selectedCategory = newSelectedCategory;
		loading = false;
		// Reset pagination state when category changes
		additionalPages = 0;
		console.log('Category changed to:', selectedCategory, 'Reset additionalPages to 0');

		// Reset auto-select flag if user manually selected a category
		if (newSelectedCategory) {
			hasAutoSelected = true;
		}
	});

	// Auto-select first category on initial load
	$effect(() => {
		if (browser && !hasAutoSelected && !selectedCategory && data.availableCategories && data.availableCategories.length > 0) {
			console.log('Auto-selecting first category:', data.availableCategories[0]);
			hasAutoSelected = true;
			handleAutoSelect(data.availableCategories[0]);
		}
	});

	// Debounced category change to prevent rapid requests
	let categoryChangeTimeout: ReturnType<typeof setTimeout> | undefined;

	// Auto-select handler
	function handleAutoSelect(categoryName: string) {
		selectedCategory = categoryName;

		// Show loading immediately
		loading = true;

		// Update URL with new category
		const url = new URL(page.url);
		url.searchParams.set('categories', categoryName);
		goto(url.toString());
	}

	// Function to load more items from all feeds
	function loadMoreItems() {
		if (loadingMore) return;

		// Check if we have more items to load
		const hasMoreItems = data.feeds && data.feeds.some((feed) => feed.success && feed.items && feed.items.length > 5 + additionalPages * 5);

		if (!hasMoreItems) {
			console.log('No more items to load. additionalPages:', additionalPages);
			return;
		}

		loadingMore = true;
		console.log('Loading more items. Current additionalPages:', additionalPages);

		// Simulate loading delay for UX
		setTimeout(() => {
			additionalPages += 1;
			loadingMore = false;
			console.log('Loaded more items. New additionalPages:', additionalPages);
		}, 300);
	}

	// Check if we need to auto-load content to fill viewport
	function checkAndLoadContent() {
		if (loadingMore || !browser) return;

		setTimeout(() => {
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;

			// If content doesn't fill the viewport and we have more items, load them
			if (documentHeight <= windowHeight + 100 && data.feeds && data.feeds.some((feed) => feed.success && feed.items && feed.items.length > 5 + additionalPages * 5)) {
				loadMoreItems();
			}
		}, 200);
	}

	// Infinite scroll handling
	function handleScroll() {
		if (loadingMore || !browser) return;

		const scrollTop = window.scrollY;
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;

		// Trigger when within 200px of the bottom
		if (scrollTop + windowHeight >= documentHeight - 200) {
			loadMoreItems();
		}
	}

	// Set up scroll listener and check for auto-load
	$effect(() => {
		if (browser) {
			console.log('Setting up scroll listener. Category:', selectedCategory, 'AdditionalPages:', additionalPages);
			window.addEventListener('scroll', handleScroll);

			// Delay auto-load check to ensure DOM is updated
			setTimeout(() => {
				checkAndLoadContent();
			}, 100);

			return () => window.removeEventListener('scroll', handleScroll);
		}
	});

	// Also check after loading more content
	$effect(() => {
		if (additionalPages > 0) {
			checkAndLoadContent();
		}
	});

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
	<title>news</title>
	<meta name="description" content="news" />
</svelte:head>

<div id="subheader">
	<!-- Controls Section -->
	{#if data.availableCategories && data.availableCategories.length > 0}
		<div class={SHARED_STYLES.controlsContainer}>
			<div class="flex items-center gap-4 w-full">
				<div class="relative dropdown-container">
					<!-- Compact dropdown button -->
					<button class="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onclick={() => (isDropdownOpen = !isDropdownOpen)}>
						<span>{selectedCategory || 'Select category...'}</span>
						<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</button>

					<!-- Dropdown menu -->
					{#if isDropdownOpen}
						<div class="absolute top-full left-0 mt-1 backdrop-blur-md bg-black/10 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-lg shadow-lg z-50">
							<div class="p-2 max-h-64 overflow-y-auto">
								{#each availableCategories as category (category)}
									<button class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer w-full text-left text-sm" onclick={() => selectCategory(category)}>
										<span>{category}</span>
										{#if selectedCategory === category}
											<svg class="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
											</svg>
										{/if}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Cache status indicator -->
				{#if data.cacheInfo && selectedCategory}
					<div class="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0 ml-auto">
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
		<!-- Initial items (first 5 from each feed) -->
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

		<!-- Additional items (shown after clicking Load More) -->
		{#if additionalPages > 0}
			{#each Array(additionalPages).fill(0) as _, pageIndex}
				{@const startIndex = 5 + pageIndex * 5}
				{@const endIndex = startIndex + 5}
				{#each data.feeds as feed}
					{#if feed.success && feed.items && feed.items.length > startIndex}
						{#each feed.items.slice(startIndex, endIndex) as item}
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
					{/if}
				{/each}
			{/each}
		{/if}

		<!-- Loading indicator for infinite scroll -->
		{#if loadingMore}
			<div class="flex justify-center mt-6">
				<div class="flex items-center gap-2 text-gray-500">
					<div class="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
					<span>Loading more...</span>
				</div>
			</div>
		{/if}
	{:else if !selectedCategory}
		<!-- Show nothing when no category selected -->
	{/if}
</div>
