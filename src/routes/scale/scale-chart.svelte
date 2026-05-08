<script lang="ts">
	import ApexCharts from 'apexcharts';

	interface Props {
		scaleResults: any[];
		bodySizeCm: number;
	}

	let { scaleResults, bodySizeCm: _bodySizeCm }: Props = $props();
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

	let dates = $derived(chartData.map((item) => item.date));
	let weights = $derived(chartData.map((item) => item.weight));
	let bodyFats = $derived(chartData.map((item) => item.bodyFat));

	// Get both series data - show both weight and bodyFat when available at same datapoint
	let chartSeries = $derived([
		{ name: 'Weight (kg)', data: weights },
		{ name: 'Body Fat (%)', data: bodyFats }
	]);

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
			series: [
				{
					name: 'Weight (kg)',
					type: 'column',
					data: weights
				},
				{
					name: 'Body Fat (%)',
					type: 'line',
					data: bodyFats
				}
			],
			chart: {
				height: 350,
				type: 'line' as const
			},
			colors: ['var(--color-primary-500)', 'var(--color-tertiary-500)'],
			stroke: {
				width: [0, 4]
			},
			dataLabels: {
				enabled: true,
				enabledOnSeries: [1]
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
						return date.getFullYear().toString();
					}
				}
			},
			legend: {
				labels: {
					colors: 'var(--scale-chart-label-color)'
				}
			},
			yaxis: [
				{
					min: Math.floor((weightMin - weightPadding) * 10) / 10,
					max: Math.ceil((weightMax + weightPadding) * 10) / 10,
					title: {
						text: 'Weight (kg)',
						style: {
							color: 'var(--scale-chart-label-color)'
						}
					},
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
					title: {
						text: 'Body Fat (%)',
						style: {
							color: 'var(--scale-chart-label-color)'
						}
					},
					labels: {
						style: {
							colors: 'var(--scale-chart-label-color)'
						}
					}
				}
			],
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
			const currentFiltered = filteredDates;

			if (!chart) {
				// Initialize chart if it doesn't exist yet
				initChart();
			} else {
				// Update existing chart with new data
				chart.updateOptions({
					series: chartSeries
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
		--scale-chart-label-color: #000000;
	}

	:global(.dark .scale-chart) {
		--scale-chart-label-color: #ffffff;
	}
</style>
