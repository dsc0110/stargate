<script lang="ts">
	import { browser } from '$app/environment';
	import { ArrowLeft, ArrowRight, RotateCw, Shuffle } from '@lucide/svelte';
	import { SHARED_STYLES } from '$lib/shared-styles';
	import type { StudyPageData, StudyViewMode } from './types';

	let { data }: { data: StudyPageData } = $props();

	let isRightPanelOpen = $state(true);
	let layoverActive = $state(false);
	let layoverStartX = $state(0);
	let layoverImageWidth = $state(0);
	let selectedViewMode = $state<StudyViewMode>('pictures');
	let selectedCategory = $state('');
	let studyImageSrc = $state<string | null>(null);
	let studyImageName = $state<string | null>(null);
	let studyImageNames = $state<string[]>([]);
	let studyCardKey = $state<string | null>(null);
	let studyCardValue = $state<string | null>(null);
	let isCardFlipped = $state(false);
	let currentRequestId = 0;
	let hasInitializedFromData = $state(false);
	let pointerDownX = 0;
	let pointerDownY = 0;

	const controlToggleGroupClass = 'inline-flex items-center gap-0.5 rounded-full border border-primary-800 p-0.5 transition-colors duration-200 dark:border-primary-400';
	const controlToggleButtonClass = 'inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs transition-colors duration-200';
	const controlToggleButtonActiveClass = 'text-primary-800 dark:text-primary-400';
	const controlToggleButtonInactiveClass = 'text-gray-500 dark:text-gray-400';
	const bottomActionButtonClass = `${SHARED_STYLES.chipBase} ${SHARED_STYLES.chipInactive} cursor-pointer inline-flex items-center gap-2 min-h-10 px-4 text-sm`;

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
		if (selectedViewMode === 'cards') {
			isCardFlipped = false;
			void loadStudyCard(selectedCategory, studyCardKey);
			return;
		}

		if (studyImageNames.length === 0) {
			return;
		}

		void loadStudyImage(selectedCategory, studyImageName);
	}

	function setViewMode(nextViewMode: StudyViewMode) {
		if (selectedViewMode === nextViewMode) {
			return;
		}

		selectedViewMode = nextViewMode;
		layoverActive = false;

		if (nextViewMode === 'cards') {
			isCardFlipped = false;
			void loadStudyCard(selectedCategory, studyCardKey);
		}
	}

	function toggleViewMode() {
		if (selectedViewMode === 'pictures') {
			if (!data.hasStudyCards) {
				return;
			}

			setViewMode('cards');
			return;
		}

		if (data.availableCategories.length === 0) {
			return;
		}

		setViewMode('pictures');
	}

	function toggleStudyCardFlip() {
		isCardFlipped = !isCardFlipped;
	}

	function toggleCategory() {
		if (data.availableCategories.length < 2) {
			return;
		}

		const nextCategory = data.availableCategories.find((category) => category !== selectedCategory) ?? selectedCategory;
		if (!nextCategory || selectedCategory === nextCategory) {
			return;
		}

		selectedCategory = nextCategory;
		layoverActive = false;

		if (selectedViewMode === 'cards') {
			isCardFlipped = false;
			void loadStudyCard(nextCategory);
			return;
		}

		void loadStudyImage(nextCategory);
	}

	type StudyImageResponse = {
		success: boolean;
		studyImageSrc: string | null;
		studyImageName: string | null;
		studyImageNames: string[];
		studyCardKey?: string | null;
		error?: string;
	};

	type StudyCardResponse = {
		success: boolean;
		studyCardKey: string | null;
		studyCardValue: string | null;
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

	async function loadStudyCard(categoryName: string, excludeCardKey?: string | null) {
		if (!browser) {
			studyCardKey = null;
			studyCardValue = null;
			return;
		}

		const requestId = ++currentRequestId;
		const params = new URLSearchParams();
		params.set('view', 'cards');
		params.set('category', categoryName);
		if (excludeCardKey) {
			params.set('exclude', excludeCardKey);
		}

		try {
			const response = await fetch(`/study?${params.toString()}`, {
				method: 'GET',
				headers: { accept: 'application/json' }
			});

			if (!response.ok) {
				throw new Error(`Unexpected /study response: ${response.status}`);
			}

			const payload = (await response.json()) as StudyCardResponse;
			if (requestId !== currentRequestId) {
				return;
			}

			studyCardKey = payload.success ? payload.studyCardKey : null;
			studyCardValue = payload.success ? payload.studyCardValue : null;
		} catch (error) {
			if (requestId !== currentRequestId) {
				return;
			}

			console.error('Failed to load study card:', error);
			studyCardKey = null;
			studyCardValue = null;
		}
	}

	$effect(() => {
		if (hasInitializedFromData) {
			return;
		}

		selectedCategory = data.selectedCategory || '';
		selectedViewMode = data.selectedViewMode || 'pictures';
		studyImageSrc = data.studyImageSrc;
		studyImageName = data.studyImageName;
		studyImageNames = data.studyImageNames || [];
		studyCardKey = data.studyCardKey;
		studyCardValue = data.studyCardValue;
		hasInitializedFromData = true;
	});
</script>

<svelte:head>
	<meta name="description" content="study" />
</svelte:head>

<section class="h-[calc(100dvh-8rem)] min-h-0 flex flex-col overflow-hidden">
	<div id="subheader" class="shrink-0">
		{#if data.availableCategories.length > 0 || data.hasStudyCards}
			<div class={SHARED_STYLES.controlsContainer}>
				<div class="flex items-center gap-2 w-full">
					{#if data.availableCategories.length > 0}
						<div class={`${controlToggleGroupClass} max-w-xl`} role="group" aria-label="Language">
							{#each data.availableCategories as category (category)}
								<button class={`${controlToggleButtonClass} ${selectedCategory === category ? controlToggleButtonActiveClass : controlToggleButtonInactiveClass}`} type="button" onclick={toggleCategory} aria-pressed={selectedCategory === category}>
									{category.toLowerCase()}
								</button>
							{/each}
						</div>
					{/if}

					<div class={controlToggleGroupClass} role="group" aria-label="View mode">
						<button
							class={`${controlToggleButtonClass} ${selectedViewMode === 'pictures' ? controlToggleButtonActiveClass : controlToggleButtonInactiveClass}`}
							type="button"
							onclick={toggleViewMode}
							disabled={selectedViewMode === 'pictures' ? !data.hasStudyCards : data.availableCategories.length === 0}
							aria-pressed={selectedViewMode === 'pictures'}
							aria-label="Pages view"
							title="Pages view"
						>
							<span>pages</span>
						</button>
						<button
							class={`${controlToggleButtonClass} ${selectedViewMode === 'cards' ? controlToggleButtonActiveClass : controlToggleButtonInactiveClass}`}
							type="button"
							onclick={toggleViewMode}
							disabled={selectedViewMode === 'pictures' ? !data.hasStudyCards : data.availableCategories.length === 0}
							aria-pressed={selectedViewMode === 'cards'}
							aria-label="Cards view"
							title="Cards view"
						>
							<span>cards</span>
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="flex-1 min-h-0 overflow-hidden">
		{#if selectedViewMode === 'cards'}
			{#if studyCardKey}
				<div class="h-full w-full py-2 flex items-center justify-center">
					<button type="button" class="group w-full max-w-2xl h-[240px] sm:h-[300px] md:h-[360px] [perspective:1200px] cursor-pointer bg-transparent border-0 p-0 text-left" onclick={toggleStudyCardFlip} aria-label="Flip study card">
						<div class={`relative h-full w-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d] ${isCardFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
							<div
								class="absolute inset-0 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-gradient-to-br from-emerald-50 via-white to-teal-100 dark:from-emerald-900/40 dark:via-slate-900 dark:to-teal-900/30 p-6 shadow-xl [backface-visibility:hidden] flex items-center justify-center text-center"
							>
								<div class="text-lg sm:text-xl font-semibold leading-relaxed break-words whitespace-pre-wrap">{studyCardKey}</div>
							</div>

							<div
								class="absolute inset-0 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-gradient-to-br from-emerald-50 via-white to-teal-100 dark:from-emerald-900/40 dark:via-slate-900 dark:to-teal-900/30 p-6 shadow-xl [transform:rotateY(180deg)] [backface-visibility:hidden] flex items-center justify-center text-center"
							>
								<div class="text-lg sm:text-xl font-semibold leading-relaxed break-words whitespace-pre-wrap">{studyCardValue ?? '(empty value)'}</div>
							</div>
						</div>
					</button>
				</div>
			{:else}
				<div class="h-full py-2 text-sm opacity-70 flex items-center">no study cards found for the selected category.</div>
			{/if}
		{:else if studyImageSrc}
			<div class="h-full w-full py-2">
				<div class="relative w-full h-full rounded overflow-hidden bg-surface-100/60 dark:bg-surface-900/40">
					<img
						src={studyImageSrc}
						alt="study"
						class="w-full h-full block cursor-pointer select-none"
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
			<div class="h-full py-2 text-sm opacity-70 flex items-center">study image not found in R2.</div>
		{/if}
	</div>

	{#if data.availableCategories.length > 0 || data.hasStudyCards}
		<div class="pt-3 pb-3 shrink-0 mt-auto sticky bottom-0 z-10 backdrop-blur-sm">
			<div class={SHARED_STYLES.controlsContainer}>
				<div class="flex items-center justify-center gap-2 w-full">
					<div class="flex items-center gap-1">
						{#if selectedViewMode === 'pictures'}
							<button
								class={bottomActionButtonClass}
								type="button"
								onclick={togglePanelSide}
								aria-pressed={isRightPanelOpen}
								aria-label={isRightPanelOpen ? 'hide right to left' : 'left to right hide'}
								title={isRightPanelOpen ? 'hide right to left' : 'left to right hide'}
							>
								<span>L</span>
								{#if isRightPanelOpen}
									<ArrowLeft class="size-5 shrink-0" />
								{:else}
									<ArrowRight class="size-5 shrink-0" />
								{/if}
								<span>R</span>
							</button>
						{:else}
							<button class={bottomActionButtonClass} type="button" onclick={toggleStudyCardFlip} disabled={!studyCardKey} aria-pressed={isCardFlipped} aria-label="Flip card" title="Flip card">
								<RotateCw class="size-5 shrink-0" />
								<span>flip</span>
							</button>
						{/if}

						<button
							class={bottomActionButtonClass}
							type="button"
							onclick={showAnotherPicture}
							disabled={selectedViewMode === 'pictures' ? studyImageNames.length < 2 : !data.hasStudyCards}
							aria-label={selectedViewMode === 'pictures' ? 'Shuffle picture' : 'Shuffle card'}
							title={selectedViewMode === 'pictures' ? 'Shuffle picture' : 'Shuffle card'}
						>
							<Shuffle class="size-5 shrink-0" />
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</section>
