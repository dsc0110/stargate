<script lang="ts">
	import ApexCharts from 'apexcharts';
	import { onMount } from 'svelte';
	import { calculatePortfolioTotal } from './utils.js';

	interface Props {
		portfolio: any[];
	}

	let { portfolio }: Props = $props();
	let chart: ApexCharts | undefined;
	let chartElement = $state<HTMLDivElement>();

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

	// Create filtered categories for x-axis labels (show first label of each year)
	let filteredDates = $derived.by(() => {
		const seenYears = new Set();
		return dates.map((date) => {
			const year = new Date(date).getFullYear();
			if (!seenYears.has(year)) {
				seenYears.add(year);
				return date;
			}
			return '';
		});
	});

	onMount(() => {
		// Chart will be initialized by the effect below when data is available
	});

	function initChart() {
		if (!chartElement) return;

		const options = {
			chart: {
				type: 'line' as const,
				height: 400,
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
			legend: {
				labels: {
					colors: ['var(--color-tertiary-500)']
				}
			},
			colors: ['var(--color-secondary-500)', 'var(--color-primary-500), var(--color-tertiary-500)'],
			dataLabels: {
				style: {
					colors: ['var(--color-tertiary-500)']
				}
			},
			series: [{ name: 'Portfolio Total', data: totals }],
			xaxis: {
				categories: filteredDates,
				labels: {
					show: true,
					style: {
						colors: ['var(--color-surface-600)']
					},
					formatter: function (value: any) {
						if (value === '') return '';
						const date = new Date(value);
						return date.getFullYear().toString();
					}
				},
				crosshairs: {
					show: false
				},
				tooltip: {
					enabled: false
				}
			},
			yaxis: {
				labels: {
					show: true,
					offsetX: -10,
					style: {
						colors: ['var(--color-surface-500)'],
						fontSize: '11px'
					},
					formatter: function (value: any) {
						// Format y-axis values with currency
						return (
							value.toLocaleString('de-DE', {
								maximumFractionDigits: 0
							}) + '€'
						);
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
					formatter: function (value: any, opts: any) {
						// Show the exact date in tooltip with proper formatting
						if (opts && typeof opts.dataPointIndex !== 'undefined') {
							const actualDate = dates[opts.dataPointIndex];
							if (actualDate) {
								const date = new Date(actualDate);
								return date.toLocaleDateString('de-DE', {
									year: 'numeric',
									month: 'short',
									day: 'numeric'
								});
							}
						}
						return value;
					}
				},
				y: {
					formatter: function (value: any) {
						// Format portfolio total with currency and decimal separators
						return (
							value.toLocaleString('de-DE', {
								minimumFractionDigits: 0,
								maximumFractionDigits: 0
							}) + '€'
						);
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
					enabled: true,
					position: 'topRight',
					offsetX: 0,
					offsetY: 0
				}
			}
		};

		chart = new ApexCharts(chartElement, options);
		chart.render();
	}

	// Initialize or update chart when data changes
	$effect(() => {
		if (chartElement && chartData.length > 0) {
			if (!chart) {
				// Initialize chart if it doesn't exist yet
				initChart();
			} else {
				// Update existing chart with new data
				chart.updateOptions({
					series: [{ name: 'Portfolio Total', data: totals }],
					legend: {
						labels: {
							colors: ['var(--color-tertiary-500)']
						}
					},
					xaxis: {
						categories: filteredDates,
						labels: {
							show: true,
							style: {
								colors: ['var(--color-surface-600)']
							},
							formatter: function (value: any) {
								if (value === '') return '';
								const date = new Date(value);
								return date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
							}
						}
					},
					yaxis: {
						labels: {
							style: {
								colors: ['var(--color-surface-500)']
							},
							formatter: function (value: any) {
								return (
									value.toLocaleString('de-DE', {
										maximumFractionDigits: 0
									}) + '€'
								);
							}
						}
					}
				});
			}
		}
	});

	// Cleanup
	$effect(() => {
		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});
</script>

<div class="w-full h-full flex flex-col items-center justify-center">
	{#if chartData.length > 0}
		<div class="w-full">
			<div bind:this={chartElement} class="w-full"></div>
		</div>
	{/if}
</div>
