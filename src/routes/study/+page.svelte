<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ShuffleIcon } from '@lucide/svelte';
	import { SHARED_STYLES } from '$lib/shared-styles';

	type StudyPageData = {
		studyImageSrc: string | null;
		studyImageName: string | null;
		studyImageNames: string[];
	};

	let { data }: { data: StudyPageData } = $props();

	// Fullscreen feature removed
	let layoverActive = $state(false);
	let layoverStartX = $state(0);

	// Fullscreen feature removed

	function startLayover(event: PointerEvent) {
		const target = event.currentTarget as HTMLElement | null;
		if (!target) {
			return;
		}

		const rect = target.getBoundingClientRect();
		layoverStartX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
		layoverActive = true;
		target?.setPointerCapture?.(event.pointerId);
	}

	function stopLayover(event: PointerEvent) {
		layoverActive = false;

		const target = event.currentTarget as HTMLElement | null;
		target?.releasePointerCapture?.(event.pointerId);
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
</script>

<svelte:head>
	<title>study</title>
	<meta name="description" content="study" />
</svelte:head>

<div id="subheader">
	{#if data.studyImageNames.length > 0}
		<div class={SHARED_STYLES.controlsContainer}>
			<div class="flex items-center gap-4 w-full px-4 pt-2">
				<button class={`${SHARED_STYLES.buttonPrimary} cursor-pointer`} type="button" onclick={showAnotherPicture} disabled={data.studyImageNames.length < 2} aria-label="Shuffle picture" title="Shuffle picture">
					<ShuffleIcon class="size-4" />
				</button>
				<!-- Fullscreen button removed -->
				<div class="text-sm text-surface-500 dark:text-surface-400 truncate">
					{data.studyImageName}
				</div>
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
				class="max-w-full h-auto rounded block"
				style="-webkit-touch-callout: none;"
				onpointerdown={startLayover}
				onpointerup={stopLayover}
				onpointercancel={stopLayover}
				onlostpointercapture={stopLayover}
				oncontextmenu={(event) => event.preventDefault()}
			/>

			{#if layoverActive}
				<div class="absolute top-0 right-0 bottom-0 pointer-events-none bg-white" style={`left: ${layoverStartX}px;`}></div>
			{/if}
		</div>
	</article>
{:else}
	<article class="p-4 text-sm opacity-70">study image not found in R2.</article>
{/if}
