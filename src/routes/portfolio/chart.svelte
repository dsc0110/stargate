<script lang="ts">
	import ApexCharts from 'apexcharts';
	import { onMount } from 'svelte';
	import { calculatePortfolioTotal } from './utils.js';

	interface Props {
		portfolio: any[];
	}

	let { portfolio }: Props = $props();
	let chart: ApexCharts | undefined;

	// Process portfolio data for chart
	let chartData = $derived(
		portfolio
			.map((entry) => ({
				date: entry.date,
				total: calculatePortfolioTotal(entry)
			}))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	);

	let dates = $derived(chartData.map((item) => item.date));
	let totals = $derived(chartData.map((item) => item.total));

	onMount(() => {
		const options = {
			chart: {
				type: 'line',
				toolbar: {
					show: false,
					tools: {
						download: false,
						selection: false,
						zoom: false,
						zoomin: false,
						zoomout: false,
						pan: false
					}
				}
			},
			colors: ['var(--color-secondary-500)', 'var(--color-primary-500), var(--color-tertiary-500)'],
			dataLabels: {
				style: {
					colors: ['black', '#E91E63', '#9C27B0']
				}
			},
			series: [{ name: 'Portfolio Total', data: totals }],
			xaxis: {
				categories: dates,
				labels: {
					show: false
				}
			},
			yaxis: {
				labels: {
					show: false
				}
			},
			tooltip: {
				enabled: true,
				enabledOnSeries: undefined,
				shared: true,
				followCursor: false,
				intersect: false,
				inverseOrder: false,
				custom: undefined,
				hideEmptySeries: true,
				fillSeriesColor: false,
				theme: 'dark',
				style: {
					fontSize: '12px',
					fontFamily: undefined
				},
				onDatasetHover: {
					highlightDataSeries: false
				},
				x: {
					show: true,
					formatter: function (value: any, opts: any) {
						// Show the exact date in tooltip with proper formatting
						if (opts && typeof opts.dataPointIndex !== 'undefined') {
							const actualDate = dates[opts.dataPointIndex];
							if (actualDate) {
								const date = new Date(actualDate);
								return date.toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'short',
									day: 'numeric'
								});
							}
						}
						return value;
					}
				},
				z: {
					formatter: undefined,
					title: 'Size: '
				},
				marker: {
					show: true
				},
				fixed: {
					enabled: false,
					position: 'topRight',
					offsetX: 0,
					offsetY: 0
				}
			}
		};
		chart = new ApexCharts(document.querySelector('#portfolio-chart'), options);
		chart.render();
	});

	// Update chart when portfolio data changes
	$effect(() => {
		if (chart && dates.length > 0) {
			chart.updateOptions({
				series: [{ name: 'Portfolio Total', data: totals }],
				xaxis: { categories: dates }
			});
		}
	});
</script>

<div id="portfolio-chart"></div>
