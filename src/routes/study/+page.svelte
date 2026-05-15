<script lang="ts">
	let { data }: { data: { studyImageSrc: string | null } } = $props();

	let isFullscreen = $state(false);

	function toggleFullscreen() {
		isFullscreen = !isFullscreen;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleFullscreen();
		}
	}
</script>

<svelte:head>
	<title>study</title>
	<meta name="description" content="study" />
</svelte:head>

{#if data.studyImageSrc}
	<article class={isFullscreen ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-0' : 'p-4'}>
		<button type="button" onclick={toggleFullscreen} onkeydown={handleKeydown} class="border-0 bg-transparent p-0 cursor-pointer">
			<img src={data.studyImageSrc} alt="study" class={isFullscreen ? 'max-h-screen max-w-screen object-contain' : 'max-w-full h-auto rounded'} />
		</button>
	</article>
{:else}
	<article class="p-4 text-sm opacity-70">study image not found in R2.</article>
{/if}
