<script lang="ts">
	import ApexCharts from 'apexcharts';

	interface Props {
		scaleResults: any[];
		bodySizeCm: number;
		metric: string;
	}

	let { scaleResults, bodySizeCm: _bodySizeCm, metric }: Props = $props();
	let chart: ApexCharts | undefined;
	let chartElement = $state<HTMLDivElement>();

	// Process scale data for chart (chronologically sorted)
	let chartData = $derived(
		scaleResults
			.map((entry) => ({
				date: entry.date,
				weight: entry.weight,
				bodyFat: entry.bodyFat
			}))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	);

	// Metric configuration
	const METRIC_CONFIG = {
		weight: {
			name: 'Weight (kg)',
			unit: ' kg',
			decimals: 1
		},
		bodyFat: {
			name: 'Body Fat (%)',
			unit: '%',
			decimals: 1
		}
	};

	let dates = $derived(chartData.map((item) => item.date));
	let weights = $derived(chartData.map((item) => item.weight));
	let bodyFats = $derived(chartData.map((item) => item.bodyFat));

	// Get current metric configuration
	let currentMetricConfig = $derived(METRIC_CONFIG[metric as keyof typeof METRIC_CONFIG] || METRIC_CONFIG.weight);

	// Get series data based on selected metric
	let seriesData = $derived.by(() => {
		switch (metric) {
			case 'bodyFat':
				return bodyFats;
			default:
				return weights;
		}
	});

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
			colors: ['var(--color-secondary-500)'],
			dataLabels: {
				style: {
					colors: ['black']
				}
			},
			series: [{ name: currentMetricConfig.name, data: seriesData }],
			xaxis: {
				categories: filteredDates,
				labels: {
					show: true,
					style: {
						colors: ['var(--scale-chart-axis-label-color)']
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
						colors: ['var(--scale-chart-axis-label-color)'],
						fontSize: '11px'
					},
					formatter: function (value: number) {
						return value.toFixed(currentMetricConfig.decimals) + currentMetricConfig.unit;
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
				hideEmptySeries: true,
				fillSeriesColor: false,
				theme: 'dark',
				style: {
					fontSize: '12px',
					fontFamily: undefined
				},
				x: {
					show: true,
					formatter: function (value: any, opts: any) {
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

	// Initialize or update chart when data or metric changes
	$effect(() => {
		if (chartElement && chartData.length > 0) {
			// Access reactive values to ensure this effect runs when they change
			const currentData = seriesData;
			const currentConfig = currentMetricConfig;
			const currentFiltered = filteredDates;

			if (!chart) {
				// Initialize chart if it doesn't exist yet
				initChart();
			} else {
				// Update existing chart with new data
				chart.updateOptions({
					series: [{ name: currentConfig.name, data: currentData }]
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

<div class="scale-chart w-full h-full flex flex-col items-center justify-center">
	{#if chartData.length > 0}
		<div class="w-full">
			<div bind:this={chartElement} class="w-full"></div>
		</div>
	{/if}
</div>

<style>
	:global(.scale-chart) {
		--scale-chart-axis-label-color: var(--color-surface-700);
	}

	:global(.dark .scale-chart) {
		--scale-chart-axis-label-color: var(--color-surface-200);
	}
</style>
