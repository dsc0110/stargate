<script lang="ts">
	import AddPortfolioItem from './add.svelte';
	import MetricCard from './metric-card.svelte';
	import PortfolioChart from './line-chart.svelte';
	import PortfolioPie from './pie-chart.svelte';
	import PortfolioTable from './table.svelte';
	import { PORTFOLIO_CONFIG, generateMetrics } from './config.js';
	import { SHARED_STYLES, getButtonClasses } from './index.js';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let active: string = $state('table');

	// Use state for portfolio data that can be updated
	let portfolio = $state(data.portfolio);

	// Derive metrics from portfolio state automatically
	let metrics = $derived(generateMetrics(portfolio));

	// React to changes in data.portfolio only
	$effect(() => {
		portfolio = data.portfolio;
	});

	// Callback function to handle new portfolio data
	function handlePortfolioAdded(newPortfolio: any[]) {
		// Update both data and local state to trigger reactivity
		data.portfolio = newPortfolio;
		portfolio = newPortfolio;
		// metrics will automatically recalculate via $derived
	}

	$inspect(portfolio).with(console.trace);
</script>

<svelte:head>
	<title>portfolio</title>
	<meta name="description" content="portfolio" />
</svelte:head>

<!-- <SubHeader /> -->
<div id="subheader" class="mb-6 lg:max-w-4xl lg:mx-auto">
	<!-- Metrics Cards -->
	<div class="grid grid-cols-3 gap-2 md:gap-4 mb-2">
		{#each metrics as metric}
			<MetricCard label={metric.label} value={metric.value} />
		{/each}
	</div>

	<!-- Controls Section -->
	<div class={SHARED_STYLES.controlsContainer}>
		<div class="flex justify-between items-center">
			<div class="flex items-center">
				{#each PORTFOLIO_CONFIG.TABS as tab}
					<button type="button" class={getButtonClasses(active === tab.id)} onclick={() => (active = tab.id)}>
						<tab.icon class={SHARED_STYLES.icon} />
					</button>
				{/each}
			</div>
			<div>
				<AddPortfolioItem onPortfolioAdded={handlePortfolioAdded} />
			</div>
		</div>
	</div>
</div>

<!-- Dynamic Component Rendering -->
<div class="lg:max-w-4xl lg:mx-auto">
	{#if active === 'chart'}
		<PortfolioChart {portfolio} />
	{:else if active === 'pie'}
		<PortfolioPie {portfolio} />
	{:else}
		<PortfolioTable {portfolio} />
	{/if}
</div>
