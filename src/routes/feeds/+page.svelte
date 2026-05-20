<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page, navigating } from '$app/stores';
	import { SHARED_STYLES } from '$lib/shared-styles';
	import { browser } from '$app/environment';
	import FeedList from './feed-list.svelte';

	let { data }: { data: PageData } = $props();

	let selectedCategory = $state('');
	let selectedSource = $state(''); // Track selected feed source
	let hasAutoSelected = $state(false); // Track if we've already auto-selected
	let isDropdownOpen = $state(false);

	// Available categories for dropdown
	const availableCategories = $derived(data.availableCategories || []);

	// Get feed sources for selected category
	const selectedFeedSources = $derived(selectedCategory ? data.categoryFeeds?.[selectedCategory] || [] : []);

	// Filter feeds based on selected source
	const filteredFeeds = $derived(selectedSource && data.feeds ? data.feeds.filter((feed) => feed.name === selectedSource) : data.feeds || []);

	// Toggle category selection (single selection only)
	const selectCategory = (categoryName: string) => {
		const newCategory = selectedCategory === categoryName ? '' : categoryName;
		selectedCategory = newCategory;
		selectedSource = '';
		isDropdownOpen = false;

		clearTimeout(categoryChangeTimeout);

		categoryChangeTimeout = setTimeout(() => {
			console.log('Debounced category change to:', newCategory);
			// Use $page.url (from SvelteKit store)
			const url = new URL($page.url);
			if (newCategory) {
				url.searchParams.set('categories', newCategory);
			}
			goto(url.toString());
		}, 300);
	};

	// Toggle source selection
	const selectSource = (sourceName: string) => {
		selectedSource = selectedSource === sourceName ? '' : sourceName;
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

	const dropdownTriggerClass = $derived(`${SHARED_STYLES.dropdownTriggerBase} ${isDropdownOpen || selectedCategory ? SHARED_STYLES.chipActive : SHARED_STYLES.chipInactive}`);
	const isLoadingFeeds = $derived(Boolean($navigating && $navigating.to?.url.pathname === '/feeds'));

	// Auto-select handler
	function handleAutoSelect(categoryName: string) {
		selectedCategory = categoryName;
		// Use $page.url (from SvelteKit store)
		const url = new URL($page.url);
		url.searchParams.set('categories', categoryName);
		goto(url.toString());
	}
</script>

<svelte:head>
	<title>feeds</title>
	<meta name="description" content="feeds" />
</svelte:head>

<div id="subheader">
	<!-- Controls Section -->
	{#if data.availableCategories && data.availableCategories.length > 0}
		<div class={SHARED_STYLES.controlsContainer}>
			<div class="flex items-center gap-1 w-full">
				<div class="relative dropdown-container">
					<button class={dropdownTriggerClass} onclick={() => (isDropdownOpen = !isDropdownOpen)}>
						<span>{selectedCategory || 'Select category...'}</span>
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</button>

					<!-- Dropdown menu -->
					{#if isDropdownOpen}
						<div class={SHARED_STYLES.dropdownMenu}>
							<div class="p-2 max-h-64 overflow-y-auto">
								{#each availableCategories as category (category)}
									<button class={`${SHARED_STYLES.dropdownItem} cursor-pointer`} onclick={() => selectCategory(category)}>
										<span>{category}</span>
										{#if selectedCategory === category}
											<svg class="w-3.5 h-3.5 ml-auto text-primary-700 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
											</svg>
										{/if}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Feed sources chips -->
				{#if selectedFeedSources.length > 0}
					<div class="flex flex-wrap gap-1 items-center max-w-xl">
						{#each selectedFeedSources as source (source)}
							<button class={`${SHARED_STYLES.chipBase} ${selectedSource === source ? SHARED_STYLES.chipActive : SHARED_STYLES.chipInactive} cursor-pointer`} onclick={() => selectSource(source)}>
								{source}
							</button>
						{/each}
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
	{:else if selectedCategory}
		{#if isLoadingFeeds}
			<!-- Loading placeholder -->
			<div class="border border-gray-300 dark:border-gray-700 rounded-lg p-3 mb-2 animate-pulse bg-gray-100 dark:bg-gray-800/40">
				<div class="flex items-start justify-between gap-3">
					<div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
					<div class="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
						<div class="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
						<div class="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
					</div>
				</div>
			</div>
		{:else}
			<FeedList feeds={filteredFeeds} />
		{/if}
	{:else if !selectedCategory}
		{#if availableCategories.length === 0}
			<div class="w-full text-center text-surface-500 dark:text-surface-400 text-sm py-8">No feeds configured yet.</div>
		{:else}
			<div class="w-full text-center text-surface-500 dark:text-surface-400 text-sm py-8">Select a category to view feeds.</div>
		{/if}
	{/if}
</div>
