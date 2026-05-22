<script lang="ts">
	import AddPortfolioItem from './add-portfolio-item.svelte';
	import { onDestroy } from 'svelte';
	import { mobileHeaderMetrics } from '$lib/mobile-header-metrics';
	import PortfolioChart from './portfolio-chart.svelte';
	import PortfolioDonut from './donut-chart.svelte';
	import PortfolioTable from './portfolio-table.svelte';
	import { PORTFOLIO_CONFIG, generateMetrics } from './config.js';
	import { SHARED_STYLES, getButtonClasses } from '$lib/shared-styles';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let active: string = $state('chart');

	// Use state for portfolio data that can be updated
	let portfolio = $state<any[]>([]);

	// Derive metrics from portfolio state automatically
	let metrics = $derived(generateMetrics(portfolio));

	// React to changes in data.portfolio only
	$effect(() => {
		portfolio = data.portfolio;
	});

	$effect(() => {
		mobileHeaderMetrics.set(metrics);
	});

	onDestroy(() => {
		mobileHeaderMetrics.set([]);
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
<div id="subheader">
	<!-- Controls Section -->
	<div class={SHARED_STYLES.controlsContainer}>
		<div class="flex w-full justify-between items-center">
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
<div>
	{#if portfolio.length === 0}
		<div class="w-full text-center text-surface-500 dark:text-surface-400 text-sm py-8">No portfolio data yet. Add your first entry to get started.</div>
	{:else if active === 'chart'}
		<PortfolioChart {portfolio} />
	{:else if active === 'pie'}
		<PortfolioDonut {portfolio} />
	{:else}
		<PortfolioTable {portfolio} />
	{/if}
</div>
