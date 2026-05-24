<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { headerDropdown } from '$lib/header-dropdown';
	import { PanelLeftOpenIcon, PanelRightOpenIcon, ShuffleIcon } from '@lucide/svelte';
	import { SHARED_STYLES } from '$lib/shared-styles';
	import type { StudyPageData } from './types';
	import { getCategoryLabel } from './utils';

	let { data }: { data: StudyPageData } = $props();

	let isRightPanelOpen = $state(true);
	let layoverActive = $state(false);
	let layoverStartX = $state(0);
	let layoverImageWidth = $state(0);
	let selectedCategory = $state('');
	let pointerDownX = 0;
	let pointerDownY = 0;

	const shuffleButtonClass = `${SHARED_STYLES.chipBase} ${SHARED_STYLES.chipInactive} cursor-pointer inline-flex items-center gap-1.5`;
	const panelToggleButtonClass = `${SHARED_STYLES.chipBase} ${SHARED_STYLES.chipInactive} cursor-pointer inline-flex items-center gap-1.5`;

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

		const url = new URL(page.url);
		if (categoryName) {
			url.searchParams.set('category', categoryName);
		} else {
			url.searchParams.delete('category');
		}
		url.searchParams.delete('image');
		goto(url.toString());
	}

	$effect(() => {
		selectedCategory = data.selectedCategory || '';
	});

	$effect(() => {
		if (data.availableCategories.length === 0) {
			headerDropdown.set({
				enabled: false,
				placeholder: 'Select...',
				selectedValue: '',
				selectedLabel: '',
				options: []
			});
			return;
		}

		headerDropdown.set({
			enabled: true,
			placeholder: 'Select category...',
			selectedValue: selectedCategory,
			selectedLabel: selectedCategory,
			options: data.availableCategories.map((category) => ({
				value: category,
				label: getCategoryLabel(category, data.categoryImageCounts)
			})),
			onSelect: (value: string) => selectCategory(value)
		});

		return () => {
			headerDropdown.set({
				enabled: false,
				placeholder: 'Select...',
				selectedValue: '',
				selectedLabel: '',
				options: []
			});
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
			<div class="flex items-center gap-1 w-full">
				<button class={shuffleButtonClass} type="button" onclick={showAnotherPicture} disabled={data.studyImageNames.length < 2} aria-label="Shuffle picture" title="Shuffle picture">
					<ShuffleIcon class="size-4" />
				</button>
				<button
					class={panelToggleButtonClass}
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
