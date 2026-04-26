<script lang="ts">
	import ScaleTable from './scale-table.svelte';
	import { ChartLine, Table, SquarePlus } from '@lucide/svelte';
	import { SHARED_STYLES, getButtonClasses } from '$lib/shared-styles';

	let scaleResults = $state<any[]>([]);
	let active: string = $state('table');

	// Configuration for scale tabs
	const SCALE_TABS = [
		{ id: 'chart', icon: ChartLine },
		{ id: 'table', icon: Table }
	];
</script>

<svelte:head>
	<title>scale</title>
	<meta name="description" content="scale" />
</svelte:head>

<div id="subheader" class="mb-4 lg:max-w-4xl lg:mx-auto">
	<!-- Controls Section -->
	<div class={SHARED_STYLES.controlsContainer}>
		<div class="flex justify-between items-center">
			<div class="flex items-center">
				{#each SCALE_TABS as tab}
					<button type="button" class={getButtonClasses(active === tab.id)} onclick={() => (active = tab.id)}>
						<tab.icon class={SHARED_STYLES.icon} />
					</button>
				{/each}
			</div>
			<div>
				<!-- Add Scale Result button will go here -->
				<button type="button" class={SHARED_STYLES.buttonGrey}>
					<SquarePlus class={SHARED_STYLES.icon} />
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Dynamic Component Rendering -->
<div class="lg:max-w-4xl lg:mx-auto">
	{#if active === 'chart'}
		<!-- Chart component will go here -->
		<div class="p-4 text-center text-gray-500">Chart view coming soon</div>
	{:else}
		<ScaleTable {scaleResults} />
	{/if}
</div>
