<script lang="ts">
	import { browser } from '$app/environment';
	import { ArrowLeft, ArrowRight, Shuffle } from '@lucide/svelte';
	import { headerDropdown } from '$lib/header-dropdown';
	import { SHARED_STYLES } from '$lib/shared-styles';
	import type { StudyPageData } from './types';
	import { getCategoryLabel } from './utils';

	let { data }: { data: StudyPageData } = $props();

	let isRightPanelOpen = $state(true);
	let layoverActive = $state(false);
	let layoverStartX = $state(0);
	let layoverImageWidth = $state(0);
	let selectedCategory = $state('');
	let studyImageSrc = $state<string | null>(null);
	let studyImageName = $state<string | null>(null);
	let studyImageNames = $state<string[]>([]);
	let currentRequestId = 0;
	let hasInitializedFromData = $state(false);
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
		if (studyImageNames.length === 0) {
			return;
		}

		void loadStudyImage(selectedCategory, studyImageName);
	}

	function selectCategory(categoryName: string) {
		selectedCategory = categoryName;
		layoverActive = false;
		void loadStudyImage(categoryName);
	}

	type StudyImageResponse = {
		success: boolean;
		studyImageSrc: string | null;
		studyImageName: string | null;
		studyImageNames: string[];
		error?: string;
	};

	async function loadStudyImage(categoryName: string, excludeImageName?: string | null) {
		if (!browser || !categoryName) {
			studyImageSrc = null;
			studyImageName = null;
			studyImageNames = [];
			return;
		}

		const requestId = ++currentRequestId;

		const params = new URLSearchParams();
		params.set('category', categoryName);
		if (excludeImageName) {
			params.set('exclude', excludeImageName);
		}

		try {
			const response = await fetch(`/study?${params.toString()}`, {
				method: 'GET',
				headers: { accept: 'application/json' }
			});

			if (!response.ok) {
				throw new Error(`Unexpected /study response: ${response.status}`);
			}

			const payload = (await response.json()) as StudyImageResponse;
			if (requestId !== currentRequestId) {
				return;
			}

			if (!payload.success) {
				studyImageSrc = null;
				studyImageName = null;
				studyImageNames = [];
				return;
			}

			studyImageSrc = payload.studyImageSrc;
			studyImageName = payload.studyImageName;
			studyImageNames = payload.studyImageNames || [];
		} catch (error) {
			if (requestId !== currentRequestId) {
				return;
			}

			console.error('Failed to load study image:', error);
			studyImageSrc = null;
			studyImageName = null;
			studyImageNames = [];
		}
	}

	$effect(() => {
		if (hasInitializedFromData) {
			return;
		}

		selectedCategory = data.selectedCategory || '';
		studyImageSrc = data.studyImageSrc;
		studyImageName = data.studyImageName;
		studyImageNames = data.studyImageNames || [];
		hasInitializedFromData = true;
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
			selectedLabel: selectedCategory.toLowerCase(),
			options: data.availableCategories.map((category) => ({
				value: category,
				label: getCategoryLabel(category, data.categoryImageCounts).toLowerCase()
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
	<meta name="description" content="study" />
</svelte:head>

<div id="subheader">
	{#if data.availableCategories.length > 0}
		<div class={SHARED_STYLES.controlsContainer}>
			<div class="flex items-center gap-1 w-full">
				<button class={shuffleButtonClass} type="button" onclick={showAnotherPicture} disabled={studyImageNames.length < 2} aria-label="Shuffle picture" title="Shuffle picture">
					<Shuffle class="size-4 shrink-0" />
					<span>shuffle</span>
				</button>
				<button
					class={panelToggleButtonClass}
					type="button"
					onclick={togglePanelSide}
					aria-pressed={isRightPanelOpen}
					aria-label={isRightPanelOpen ? 'hide right to left' : 'left to right hide'}
					title={isRightPanelOpen ? 'hide right to left' : 'left to right hide'}
				>
					{#if isRightPanelOpen}
						<ArrowLeft class="size-4 shrink-0" />
					{:else}
						<ArrowRight class="size-4 shrink-0" />
					{/if}
					<span>toggle</span>
				</button>
			</div>
		</div>
	{/if}
</div>

{#if studyImageSrc}
	<div class="py-4">
		<div class="relative w-full h-[calc(100vh-9rem)] min-h-[320px] rounded overflow-hidden bg-surface-100/60 dark:bg-surface-900/40">
			<img
				src={studyImageSrc}
				alt="study"
				class="w-full h-full object-contain block cursor-pointer select-none"
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
	</div>
{:else}
	<div class="py-4 text-sm opacity-70">study image not found in R2.</div>
{/if}
