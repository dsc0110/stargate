<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SHARED_STYLES, getChipClasses } from '$lib/shared-styles';
	import { browser } from '$app/environment';
	import { FEED_CONFIG } from './config';
	import FeedList from '$lib/feed-list.svelte';

	let { data }: { data: PageData } = $props();

	let selectedCategory = $state('');
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
		console.log('Category changed to:', selectedCategory);

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

		// Update URL with new category
		const url = new URL(page.url);
		url.searchParams.set('categories', categoryName);
		goto(url.toString());
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
	{:else if data.feeds && selectedCategory}
		<FeedList feeds={data.feeds} initialLimit={FEED_CONFIG.INITIAL_ITEMS_LIMIT} loadMoreIncrement={FEED_CONFIG.LOAD_MORE_INCREMENT} />
	{:else if !selectedCategory}
		<!-- Show nothing when no category selected -->
	{/if}
</div>
