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
		if (!chartElement) return;

		const data = pieData();

		const options = {
			chart: {
				type: 'donut' as const,
				height: 350,
				background: 'transparent'
			},
			plotOptions: {
				pie: {
					donut: {
						size: '70%'
					}
				}
			},
			series: [data.cash, data.depot],
			labels: ['Cash', 'Depot'],
			colors: ['var(--color-primary-500)', 'var(--color-secondary-500)'],
			legend: {
				position: 'bottom' as const,
				labels: {
					colors: ['var(--color-primary-500)', 'var(--color-secondary-500)']
				}
			},
			dataLabels: {
				enabled: true,
				formatter: function (val: number, opts: any) {
					const value = opts.w.config.series[opts.seriesIndex];
					return `${val.toFixed(1)}%`;
				},
				style: {
					fontSize: '12px',
					colors: ['white']
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
					breakpoint: 1024,
					options: {
						chart: {
							height: 300
						},
						legend: {
							position: 'bottom' as const
						}
					}
				}
			]
		};

		chart = new ApexCharts(chartElement!, options);
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
		</div>
	{:else}
		<div class="text-center text-gray-500 dark:text-gray-400">
			<p>No portfolio data available</p>
		</div>
	{/if}
</div>
