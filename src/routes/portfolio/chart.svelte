<script lang="ts">
	import ApexCharts from 'apexcharts';
	import { onMount } from 'svelte';
	import { calculatePortfolioTotal } from './utils.js';

	interface Props {
		portfolio: any[];
	}

	let { portfolio }: Props = $props();
	let chart;

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

	// Extract unique years for x-axis labels
	let years = $derived([...new Set(chartData.map((item) => new Date(item.date).getFullYear().toString()))].sort());

	// Create year-based categories for chart
	let yearCategories = $derived(chartData.map((item) => new Date(item.date).getFullYear().toString()));

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
					show: true,
					rotateAlways: false,
					maxHeight: 120,
					formatter: function (value, timestamp, opts) {
						// Only show label if it's the first occurrence of that year
						const currentIndex = opts.dataPointIndex;
						const currentYear = new Date(value).getFullYear().toString();

						// Check if this is the first occurrence of this year
						for (let i = 0; i < currentIndex; i++) {
							const prevDate = dates[i];
							const prevYear = new Date(prevDate).getFullYear().toString();
							if (prevYear === currentYear) {
								return ''; // Hide if we've already shown this year
							}
						}

						return currentYear; // Show the year
					}
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
					formatter: function (value, opts) {
						// Show the exact date in tooltip
						return value; // value is already the date since categories are dates
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
