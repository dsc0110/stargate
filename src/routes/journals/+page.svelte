<script lang="ts">
	import type { PageData } from './$types';
	import { SHARED_STYLES } from '$lib/shared-styles';
	import { browser } from '$app/environment';
	import { JOURNALS_CONFIG } from './config';
	import { Combobox, Portal, useListCollection } from '@skeletonlabs/skeleton-svelte';
	import FeedList from '$lib/feed-list.svelte';

	let { data }: { data: PageData } = $props();

	// Create journal feeds options from data
	const journalFeeds = $derived(data.feeds ? data.feeds.filter((feed) => feed.success).map((feed) => ({ label: feed.name, value: feed.name })) : []);

	let selectedFeeds: string[] = $state([]);
	let isDropdownOpen = $state(false);

	// Initialize with all feeds selected by default
	$effect(() => {
		if (journalFeeds.length > 0 && selectedFeeds.length === 0) {
			selectedFeeds = journalFeeds.map((feed) => feed.value);
		}
	});

	// Toggle feed selection
	const toggleFeed = (feedName: string) => {
		if (selectedFeeds.includes(feedName)) {
			selectedFeeds = selectedFeeds.filter((name) => name !== feedName);
		} else {
			selectedFeeds = [...selectedFeeds, feedName];
		}
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

	let loading = $state(false);

	// Filter feeds based on selection
	const filteredFeeds = $derived(
		selectedFeeds.length === 0
			? data.feeds // Show all feeds if none selected
			: data.feeds?.filter((feed) => selectedFeeds.includes(feed.name))
	);

	// Client-side cache to avoid redundant requests
	const clientCache = new Map<string, { data: PageData; timestamp: number; expires: number }>();

	// Update loading state when data changes
	$effect(() => {
		loading = false;
		console.log('Data changed');
	});

	// Cache successful data loads
	$effect(() => {
		if (data && !data.error && browser) {
			const cacheKey = 'journals';
			const timestamp = Date.now();
			clientCache.set(cacheKey, {
				data: { ...data },
				timestamp,
				expires: timestamp + JOURNALS_CONFIG.CLIENT_CACHE_DURATION
			});

			// Cleanup old cache entries
			for (const [key, entry] of clientCache.entries()) {
				if (timestamp > entry.expires + JOURNALS_CONFIG.CLIENT_CACHE_DURATION) {
					clientCache.delete(key);
				}
			}
		}
	});
</script>

<svelte:head>
	<title>journals</title>
	<meta name="description" content="journals" />
</svelte:head>

<div id="subheader">
	<div class={SHARED_STYLES.controlsContainer}>
		<div class="flex items-center gap-4 w-full">
			<div class="relative dropdown-container">
				<!-- Compact dropdown button -->
				<button class="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onclick={() => (isDropdownOpen = !isDropdownOpen)}>
					<span>
						{#if selectedFeeds.length === journalFeeds.length}
							All
						{:else}
							{selectedFeeds.length}/{journalFeeds.length}
						{/if}
					</span>
					<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
					</svg>
				</button>

				<!-- Dropdown menu -->
				{#if isDropdownOpen}
					<div class="absolute top-full left-0 mt-1 backdrop-blur-md bg-black/10 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-lg shadow-lg z-50">
						<div class="p-2 max-h-64 overflow-y-auto">
							{#each journalFeeds as feed (feed.value)}
								<label class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
									<input type="checkbox" checked={selectedFeeds.includes(feed.value)} onchange={() => toggleFeed(feed.value)} class="rounded" />
									<span class="text-sm">{feed.label}</span>
								</label>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Cache status indicator -->
			{#if data.cacheInfo}
				<div class="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0 ml-auto">
					<span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
				</div>
			{/if}
		</div>
	</div>
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
			{#each Array(JOURNALS_CONFIG.LOADING_PLACEHOLDER_COUNT) as _}
				<div class="placeholder animate-pulse border border-gray-200 dark:border-gray-700 rounded-lg p-2">
					<div class="py-2">
						<div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
						<div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else if filteredFeeds}
		<FeedList feeds={filteredFeeds} />
	{/if}
</div>
