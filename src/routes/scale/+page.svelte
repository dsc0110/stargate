<script lang="ts">
	import ScaleTable from './scale-table.svelte';
	import ScaleChart from './scale-chart.svelte';
	import AddScaleResult from './add-scale-result.svelte';
	import MetricCard from '$lib/metric-card.svelte';
	import { generateScaleMetrics } from './config.js';
	import { ChartLine, Table } from '@lucide/svelte';
	import { SHARED_STYLES, getButtonClasses } from '$lib/shared-styles';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let active: string = $state('chart');
	let showRecentOnly = $state(true);

	// Configuration for scale tabs
	const SCALE_TABS = [
		{ id: 'table', icon: Table },
		{ id: 'chart', icon: ChartLine }
	];

	// Use state for scale results data that can be updated
	let scaleResults = $state<any[]>([]);

	// Derive metrics from scale results state automatically
	let metrics = $derived(generateScaleMetrics(scaleResults, data.bodySizeCm));

	// React to changes in data.scaleResults only
	$effect(() => {
		scaleResults = data.scaleResults;
	});

	// Callback function to handle new scale data
	function handleScaleResultAdded(newScaleResults: any[]) {
		// Update both data and local state to trigger reactivity
		data.scaleResults = newScaleResults;
		scaleResults = newScaleResults;
		// metrics will automatically recalculate via $derived
	}
</script>

<svelte:head>
	<title>scale</title>
	<meta name="description" content="scale" />
</svelte:head>

<div id="subheader">
	<!-- Metrics Cards -->
	<div class="grid grid-cols-3 gap-2 md:gap-4 mb-4">
		{#each metrics as metric}
			<MetricCard label={metric.label} value={metric.value} />
		{/each}
	</div>

	<!-- Controls Section -->
	<div class={SHARED_STYLES.controlsContainer}>
		<div class="flex justify-between items-center">
			<div class="flex items-center gap-2">
				{#each SCALE_TABS as tab}
					<button type="button" class={getButtonClasses(active === tab.id)} onclick={() => (active = tab.id)}>
						<tab.icon class={SHARED_STYLES.icon} />
					</button>
				{/each}
				{#if active === 'chart'}
					<button
						type="button"
						onclick={() => (showRecentOnly = !showRecentOnly)}
						class={`${SHARED_STYLES.chipBase} ${showRecentOnly ? SHARED_STYLES.chipActive : SHARED_STYLES.chipInactive} cursor-pointer`}
						title={showRecentOnly ? 'Show all results' : 'Show last 12 months'}
					>
						last year
					</button>
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
	{#if scaleResults.length === 0}
		<div class="w-full text-center text-surface-500 dark:text-surface-400 text-sm py-8">No scale results yet. Add your first measurement to get started.</div>
	{:else if active === 'chart'}
		<ScaleChart {scaleResults} bodySizeCm={data.bodySizeCm} recentOnly={showRecentOnly} />
	{:else}
		<ScaleTable {scaleResults} bodySizeCm={data.bodySizeCm} />
	{/if}
</div>
