<script lang="ts">
	import ScaleTable from './scale-table.svelte';
	import ScaleChart from './scale-chart.svelte';
	import AddScaleResult from './add-scale-result.svelte';
	import { ChartLine, Table } from '@lucide/svelte';
	import { SHARED_STYLES, getButtonClasses } from '$lib/shared-styles';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let active: string = $state('table');

	// Configuration for scale tabs
	const SCALE_TABS = [
		{ id: 'table', icon: Table },
		{ id: 'chart', icon: ChartLine }
	];

	// Use state for scale results data that can be updated
	let scaleResults = $state<any[]>([]);

	// React to changes in data.scaleResults only
	$effect(() => {
		scaleResults = data.scaleResults;
	});

	// Callback function to handle new scale data
	function handleScaleResultAdded(newScaleResults: any[]) {
		// Update both data and local state to trigger reactivity
		data.scaleResults = newScaleResults;
		scaleResults = newScaleResults;
	}
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
				<AddScaleResult onScaleResultAdded={handleScaleResultAdded} />
			</div>
		</div>
	</div>
</div>

<!-- Dynamic Component Rendering -->
<div class="lg:max-w-4xl lg:mx-auto">
	{#if active === 'chart'}
		<ScaleChart {scaleResults} bodySizeCm={data.bodySizeCm} />
	{:else}
		<ScaleTable {scaleResults} bodySizeCm={data.bodySizeCm} />
	{/if}
</div>
