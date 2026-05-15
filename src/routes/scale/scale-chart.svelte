<script lang="ts">
	import ApexCharts from 'apexcharts';

	interface Props {
		scaleResults: any[];
		bodySizeCm: number;
		recentOnly?: boolean;
	}

	let { scaleResults, bodySizeCm: _bodySizeCm, recentOnly = false }: Props = $props();
	let chart: ApexCharts | undefined;
	let chartElement = $state<HTMLDivElement>();

	// Process scale data for chart (chronologically sorted)
	let chartData = $derived(
		scaleResults
			.map((entry) => ({
				date: entry.date,
				weight: entry.weight,
				bodyFat: entry.bodyFat ?? null
			}))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	);

	let recentChartData = $derived.by(() => {
		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

		return chartData.filter((item) => new Date(item.date) >= oneYearAgo);
	});

	let visibleChartData = $derived(recentOnly ? recentChartData : chartData);
	let showBodyFat = $derived(recentOnly);

	let dates = $derived(visibleChartData.map((item) => item.date));
	let weights = $derived(visibleChartData.map((item) => item.weight));
	let bodyFats = $derived(visibleChartData.map((item) => item.bodyFat));

	// Body fat is only shown in last-year mode.
	let chartSeries = $derived.by(() => {
		if (showBodyFat) {
			return [
				{ name: 'Weight (kg)', type: 'column', data: weights },
				{ name: 'Body Fat (%)', type: 'line', data: bodyFats }
			];
		}

		return [{ name: 'Weight (kg)', type: 'column', data: weights }];
	});

	// Create filtered categories for x-axis labels (show first label of each year)
	let filteredDates = $derived.by(() => {
		if (recentOnly) {
			return dates;
		}

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

		// Calculate dynamic min/max for weight axis
		const validWeights = weights.filter((w) => w != null);
		const weightMin = validWeights.length > 0 ? Math.min(...validWeights) : 0;
		const weightMax = validWeights.length > 0 ? Math.max(...validWeights) : 100;
		const weightPadding = (weightMax - weightMin) * 0.1 || 10;

		// Calculate dynamic min/max for body fat axis
		const validBodyFats = bodyFats.filter((bf) => bf != null);
		const bodyFatMin = validBodyFats.length > 0 ? Math.min(...validBodyFats) : 0;
		const bodyFatMax = validBodyFats.length > 0 ? Math.max(...validBodyFats) : 100;
		const bodyFatPadding = (bodyFatMax - bodyFatMin) * 0.1 || 10;

		const options = {
			series: chartSeries,
			chart: {
				height: 350,
				type: 'line' as const,
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
			colors: showBodyFat ? ['var(--color-primary-500)', 'var(--color-tertiary-500)'] : ['var(--color-primary-500)'],
			stroke: {
				width: showBodyFat ? [0, 4] : [0]
			},
			dataLabels: {
				enabled: showBodyFat,
				enabledOnSeries: showBodyFat ? [1] : []
			},
			labels: dates,
			xaxis: {
				categories: filteredDates,
				labels: {
					show: true,
					style: {
						colors: 'var(--scale-chart-label-color)'
					},
					formatter: function (value: any) {
						if (value === '') return '';
						const date = new Date(value);

						if (recentOnly) {
							const month = String(date.getMonth() + 1).padStart(2, '0');
							const year = String(date.getFullYear());
							return `${month}/${year}`;
						}

						return date.getFullYear().toString();
					}
				}
			},
			legend: {
				labels: {
					colors: 'var(--scale-chart-label-color)'
				}
			},
			yaxis: showBodyFat
				? [
						{
							min: Math.floor((weightMin - weightPadding) * 10) / 10,
							max: Math.ceil((weightMax + weightPadding) * 10) / 10,
							labels: {
								style: {
									colors: 'var(--scale-chart-label-color)'
								}
							}
						},
						{
							opposite: true,
							min: Math.floor((bodyFatMin - bodyFatPadding) * 10) / 10,
							max: Math.ceil((bodyFatMax + bodyFatPadding) * 10) / 10,
							labels: {
								style: {
									colors: 'var(--scale-chart-label-color)'
								}
							}
						}
					]
				: {
						min: Math.floor((weightMin - weightPadding) * 10) / 10,
						max: Math.ceil((weightMax + weightPadding) * 10) / 10,
						labels: {
							style: {
								colors: 'var(--scale-chart-label-color)'
							}
						}
					},
			tooltip: {
				enabled: true,
				shared: true,
				followCursor: false,
				intersect: false,
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

	// Recreate chart whenever visible dataset or mode changes.
	$effect(() => {
		if (!chartElement) return;

		if (chart) {
			chart.destroy();
			chart = undefined;
		}

		if (visibleChartData.length > 0) {
			initChart();
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
	{#if visibleChartData.length > 0}
		<div class="w-full">
			<div bind:this={chartElement} class="w-full"></div>
		</div>
	{:else}
		<div class="w-full text-center text-surface-500 dark:text-surface-400 text-sm py-8">No scale results in the last year.</div>
	{/if}
</div>

<style>
	:global(.scale-chart) {
		--scale-chart-label-color: #000000;
	}

	:global(.dark .scale-chart) {
		--scale-chart-label-color: #ffffff;
	}
</style>
