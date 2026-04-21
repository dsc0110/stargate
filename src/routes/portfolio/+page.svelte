<script lang="ts">
	import PortfolioTable from './table.svelte';
	import PortfolioChart from './chart.svelte';
	import AddPortfolioItem from './add.svelte';
	import MetricCard from './MetricCard.svelte';
	import { Table, ChartLine } from '@lucide/svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let active = $state('table');

	let portfolio = $derived(data.portfolio);
	$inspect(portfolio).with(console.trace);

	// Reusable style constants
	const styles = {
		container: 'preset-filled-surface-100-900 rounded-xl p-1 border border-gray-200 dark:border-gray-700',
		buttonBase: 'btn rounded-lg px-3 py-2 transition-all duration-200 hover:bg-primary-100 dark:hover:bg-primary-800',
		icon: 'w-4 h-4'
	};

	// Metric cards data
	const metrics = [
		{ label: 'Value', value: '350.781€' },
		{ label: 'Year over Year', value: '+100k€' },
		{ label: '1M€ by', value: 'Jan 2035' }
	];

	// Tab configuration
	const tabs = [
		{ id: 'chart', icon: ChartLine, component: PortfolioChart },
		{ id: 'table', icon: Table, component: PortfolioTable }
	];

	// Helper function for button classes
	function getButtonClasses(isActive: boolean) {
		return `${styles.buttonBase} ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`;
	}

	// Get active component
	const activeComponent = $derived(tabs.find((tab) => tab.id === active)?.component || PortfolioTable);
</script>

<svelte:head>
	<title>portfolio</title>
	<meta name="description" content="portfolio" />
</svelte:head>

<!-- <SubHeader /> -->
<div id="subheader" class="mb-6">
	<!-- Metrics Cards -->
	<div class="grid grid-cols-3 gap-2 md:gap-4 mb-2">
		{#each metrics as metric}
			<MetricCard label={metric.label} value={metric.value} />
		{/each}
	</div>

	<!-- Controls Section -->
	<div class="flex justify-between items-center gap-4">
		<div class="flex items-center space-x-4">
			<div class={styles.container}>
				<div class="flex">
					{#each tabs as tab}
						<button type="button" class={getButtonClasses(active === tab.id)} onclick={() => (active = tab.id)}>
							<tab.icon class={styles.icon} />
						</button>
					{/each}
				</div>
			</div>
		</div>
		<div class={styles.container}>
			<div class="flex">
				<AddPortfolioItem />
			</div>
		</div>
	</div>
</div>

<!-- Dynamic Component Rendering -->
<svelte:component this={activeComponent} {portfolio} />
