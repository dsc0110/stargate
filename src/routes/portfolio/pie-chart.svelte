<script lang="ts">
	import ApexCharts from 'apexcharts';
	import { onMount } from 'svelte';

	interface Props {
		portfolio: any[];
	}

	let { portfolio }: Props = $props();
	let chart: ApexCharts | undefined;
	let chartElement = $state<HTMLDivElement>();

	// Calculate current values (latest entry)
	let latestEntry = $derived(() => {
		if (!portfolio || portfolio.length === 0) return null;
		// Sort by date and get the most recent entry
		const sorted = [...portfolio].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		return sorted[0];
	});

	let pieData = $derived(() => {
		if (!latestEntry()) return { cash: 0, depot: 0 };

		const entry = latestEntry();
		const cash = entry.accounts.dkbCash + entry.accounts.zkbCash;
		const depot = entry.accounts.dkbDepot;

		return { cash, depot };
	});

	onMount(() => {
		if (chartElement) {
			initChart();
		}
	});

	function initChart() {
		const data = pieData();

		const options = {
			chart: {
				type: 'pie',
				height: 350,
				background: 'transparent'
			},
			series: [data.cash, data.depot],
			labels: ['Cash', 'Depot'],
			colors: ['var(--color-secondary-200)', 'var(--color-secondary-700)'],
			legend: {
				position: 'bottom',
				labels: {
					colors: ['#374151']
				}
			},
			dataLabels: {
				enabled: true,
				formatter: function (val: number, opts: any) {
					const value = opts.w.config.series[opts.seriesIndex];
					return `${val.toFixed(1)}%\n€${value.toLocaleString()}`;
				},
				style: {
					fontSize: '12px',
					fontWeight: 'bold'
				}
			},
			tooltip: {
				y: {
					formatter: function (val: number) {
						return `€${val.toLocaleString()}`;
					}
				}
			},
			responsive: [
				{
					breakpoint: 768,
					options: {
						chart: {
							height: 300
						},
						legend: {
							position: 'bottom'
						}
					}
				}
			]
		};

		chart = new ApexCharts(chartElement, options);
		chart.render();
	}

	// Update chart when data changes
	$effect(() => {
		if (chart && latestEntry()) {
			const data = pieData();
			chart.updateSeries([data.cash, data.depot]);
		}
	});
</script>

<div class="w-full h-full flex flex-col items-center justify-center">
	{#if latestEntry()}
		<div class="w-full max-w-md">
			<div bind:this={chartElement} class="w-full"></div>
			<div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
				{latestEntry().date}
			</div>
		</div>
	{:else}
		<div class="text-center text-gray-500 dark:text-gray-400">
			<p>No portfolio data available</p>
		</div>
	{/if}
</div>
