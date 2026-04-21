<script lang="ts">
	import AddPortfolioItem from './add.svelte';
	import MetricCard from './MetricCard.svelte';
	import PortfolioChart from './chart.svelte';
	import PortfolioTable from './table.svelte';
	import { PORTFOLIO_CONFIG, SHARED_STYLES, getButtonClasses } from './index.js';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let active = $state(PORTFOLIO_CONFIG.DEFAULT_TAB);

	let portfolio = $derived(data.portfolio);
	$inspect(portfolio).with(console.trace);
</script>

<svelte:head>
	<title>portfolio</title>
	<meta name="description" content="portfolio" />
</svelte:head>

<!-- <SubHeader /> -->
<div id="subheader" class="mb-6">
	<!-- Metrics Cards -->
	<div class="grid grid-cols-3 gap-2 md:gap-4 mb-2">
		{#each PORTFOLIO_CONFIG.METRICS as metric}
			<MetricCard label={metric.label} value={metric.value} />
		{/each}
	</div>

	<!-- Controls Section -->
	<div class="flex justify-between items-center gap-4">
		<div class="flex items-center space-x-4">
			<div class={SHARED_STYLES.container}>
				<div class="flex">
					{#each PORTFOLIO_CONFIG.TABS as tab}
						<button type="button" class={getButtonClasses(active === tab.id)} onclick={() => (active = tab.id)}>
							<tab.icon class={SHARED_STYLES.icon} />
						</button>
					{/each}
				</div>
			</div>
		</div>
		<div class={SHARED_STYLES.container}>
			<div class="flex">
				<AddPortfolioItem />
			</div>
		</div>
	</div>
</div>

<!-- Dynamic Component Rendering -->
{#if active === 'chart'}
	<PortfolioChart {portfolio} />
{:else}
	<PortfolioTable {portfolio} />
{/if}
