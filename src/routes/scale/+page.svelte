<script lang="ts">
	import ScaleTable from './scale-table.svelte';
	import ScaleChart from './scale-chart.svelte';
	import AddScaleResult from './add-scale-result.svelte';
	import { ChartLine, Table, Weight, Activity, Percent } from '@lucide/svelte';
	import { SHARED_STYLES, getButtonClasses } from '$lib/shared-styles';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let active: string = $state('chart');
	let selectedMetric: string = $state('weight');

	// Configuration for scale tabs
	const SCALE_TABS = [
		{ id: 'table', icon: Table },
		{ id: 'chart', icon: ChartLine }
	];

	// Configuration for metric tabs
	const METRIC_TABS = [
		{ id: 'weight', icon: Weight, label: 'Weight' },
		{ id: 'bmi', icon: Activity, label: 'BMI' },
		{ id: 'bodyFat', icon: Percent, label: 'Body Fat' }
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

<div id="subheader">
	<!-- Controls Section -->
	<div class={SHARED_STYLES.controlsContainer}>
		<div class="flex justify-between items-center">
			<div class="flex items-center">
				{#each SCALE_TABS as tab}
					<button type="button" class={getButtonClasses(active === tab.id)} onclick={() => (active = tab.id)}>
						<tab.icon class={SHARED_STYLES.icon} />
					</button>
				{/each}

				{#if active === 'chart'}
					<div class="ml-4 border-l pl-4 flex items-center gap-1">
						{#each METRIC_TABS as metric}
							<button type="button" class={getButtonClasses(selectedMetric === metric.id)} title={metric.label} onclick={() => (selectedMetric = metric.id)}>
								<metric.icon class={SHARED_STYLES.icon} />
							</button>
						{/each}
					</div>
				{/if}
			</div>
			<div>
				<AddScaleResult onScaleResultAdded={handleScaleResultAdded} />
			</div>
		</div>
	</div>
</div>

<!-- Dynamic Component Rendering -->
<div>
	{#if active === 'chart'}
		<ScaleChart {scaleResults} bodySizeCm={data.bodySizeCm} metric={selectedMetric} />
	{:else}
		<ScaleTable {scaleResults} bodySizeCm={data.bodySizeCm} />
	{/if}
</div>
