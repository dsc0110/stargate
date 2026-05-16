<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { PanelLeftOpenIcon, PanelRightOpenIcon, ShuffleIcon } from '@lucide/svelte';
	import { SHARED_STYLES } from '$lib/shared-styles';

	type StudyPageData = {
		studyImageSrc: string | null;
		studyImageName: string | null;
		studyImageNames: string[];
		availableCategories: string[];
		selectedCategory: string;
	};

	let { data }: { data: StudyPageData } = $props();

	let isRightPanelOpen = $state(true);
	let layoverActive = $state(false);
	let layoverStartX = $state(0);
	let layoverImageWidth = $state(0);
	let selectedCategory = $state('');
	let isDropdownOpen = $state(false);
	let pointerDownX = 0;
	let pointerDownY = 0;

	function togglePanelSide() {
		isRightPanelOpen = !isRightPanelOpen;
	}

	function toggleLayover(event: PointerEvent) {
		const target = event.currentTarget as HTMLElement | null;
		if (!target) {
			return;
		}

		if (event.type === 'pointerdown') {
			// Store the initial pointer position
			pointerDownX = event.clientX;
			pointerDownY = event.clientY;
			target?.setPointerCapture?.(event.pointerId);
		} else if (event.type === 'pointerup') {
			// Only toggle if pointer moved less than 10px (tap gesture)
			const moveDistance = Math.sqrt(Math.pow(event.clientX - pointerDownX, 2) + Math.pow(event.clientY - pointerDownY, 2));

			if (moveDistance < 10) {
				if (layoverActive) {
					// Deactivate layover on second click
					layoverActive = false;
				} else {
					// Activate layover on first click
					const rect = target.getBoundingClientRect();
					layoverImageWidth = rect.width;
					layoverStartX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
					layoverActive = true;
				}
			}

			target?.releasePointerCapture?.(event.pointerId);
		}
	}

	function showAnotherPicture() {
		if (data.studyImageNames.length === 0) {
			return;
		}

		const candidates = data.studyImageNames.filter((name: string) => name !== data.studyImageName);
		const nextImageName = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : data.studyImageNames[0];

		const url = new URL(page.url);
		url.searchParams.set('image', nextImageName);
		goto(url.toString());
	}

	function selectCategory(categoryName: string) {
		selectedCategory = categoryName;
		isDropdownOpen = false;

		const url = new URL(page.url);
		if (categoryName) {
			url.searchParams.set('category', categoryName);
		} else {
			url.searchParams.delete('category');
		}
		url.searchParams.delete('image');
		goto(url.toString());
	}

	function handleOutsideClick(event: Event) {
		const target = event.target as Element;
		if (!target.closest('.dropdown-container')) {
			isDropdownOpen = false;
		}
	}

	$effect(() => {
		selectedCategory = data.selectedCategory || '';
	});

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
</script>

<svelte:head>
	<title>study</title>
	<meta name="description" content="study" />
</svelte:head>

<div id="subheader">
	{#if data.availableCategories.length > 0}
		<div class={SHARED_STYLES.controlsContainer}>
			<div class="flex items-center gap-4 w-full">
				<div class="relative dropdown-container">
					<button
						class={`flex items-center gap-2 p-2 border rounded-lg text-sm ${isDropdownOpen ? 'backdrop-blur-md bg-black/10 dark:bg-white/10 border-white/30 dark:border-white/20' : 'border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}`}
						type="button"
						onclick={() => (isDropdownOpen = !isDropdownOpen)}
						aria-label="Select category"
						title="Select category"
					>
						<span>{selectedCategory || 'Select category...'}</span>
						<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
						</svg>
					</button>

					{#if isDropdownOpen}
						<div class="absolute top-full left-0 mt-1 backdrop-blur-md bg-black/10 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-lg shadow-lg z-50">
							<div class="p-2 max-h-64 overflow-y-auto">
								{#each data.availableCategories as category (category)}
									<button class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer w-full text-left text-sm" type="button" onclick={() => selectCategory(category)}>
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
				<button class={`${SHARED_STYLES.buttonPrimary} cursor-pointer flex items-center gap-1.5`} type="button" onclick={showAnotherPicture} disabled={data.studyImageNames.length < 2} aria-label="Shuffle picture" title="Shuffle picture">
					<span class="text-xs">{data.studyImageNames.length}</span><ShuffleIcon class="size-4" />
				</button>
				<button
					class={`${SHARED_STYLES.buttonPrimary} cursor-pointer`}
					type="button"
					onclick={togglePanelSide}
					aria-pressed={isRightPanelOpen}
					aria-label={isRightPanelOpen ? 'Panel right open' : 'Panel left open'}
					title={isRightPanelOpen ? 'Panel right open' : 'Panel left open'}
				>
					{#if isRightPanelOpen}
						<PanelRightOpenIcon class="size-4" />
					{:else}
						<PanelLeftOpenIcon class="size-4" />
					{/if}
				</button>
			</div>
		</div>
	{/if}
</div>

{#if data.studyImageSrc}
	<article class="p-4">
		<div class="relative inline-block rounded overflow-hidden">
			<img
				src={data.studyImageSrc}
				alt="study"
				class="max-w-full h-auto rounded block cursor-pointer"
				style="-webkit-touch-callout: none;"
				onpointerdown={toggleLayover}
				onpointerup={toggleLayover}
				onpointercancel={() => (layoverActive = false)}
				oncontextmenu={(event) => event.preventDefault()}
			/>

			{#if layoverActive}
				{#if isRightPanelOpen}
					<div class="absolute top-0 right-0 bottom-0 pointer-events-none backdrop-blur-sm" style={`left: ${layoverStartX}px;`}></div>
				{:else}
					<div class="absolute top-0 left-0 bottom-0 pointer-events-none backdrop-blur-sm" style={`width: ${Math.max(0, Math.min(layoverImageWidth, layoverStartX))}px;`}></div>
				{/if}
			{/if}
		</div>
	</article>
{:else}
	<article class="p-4 text-sm opacity-70">study image not found in R2.</article>
{/if}
