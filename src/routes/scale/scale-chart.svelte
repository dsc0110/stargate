<script lang="ts">
	import ApexCharts from 'apexcharts';
	import { onMount } from 'svelte';
	import { calculateBMI } from './utils.js';

	interface Props {
		scaleResults: any[];
		bodySizeCm: number;
	}

	let { scaleResults, bodySizeCm }: Props = $props();
	let chart: ApexCharts | undefined;
	let chartElement = $state<HTMLDivElement>();

	// Process scale data for chart (chronologically sorted)
	let chartData = $derived(
		scaleResults
			.map((entry) => ({
				date: entry.date,
				weight: entry.weight,
				bodyFat: entry.bodyFat,
				bmi: bodySizeCm > 0 ? calculateBMI(entry.weight, bodySizeCm) : 0
			}))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	);

	let dates = $derived(chartData.map((item) => item.date));
	let weights = $derived(chartData.map((item) => item.weight));
	let bodyFats = $derived(chartData.map((item) => item.bodyFat));
	let bmis = $derived(chartData.map((item) => item.bmi));

	// Create filtered categories for x-axis labels (show first label of each month)
	let filteredDates = $derived.by(() => {
		const seenMonths = new Set();
		return dates.map((date) => {
			const monthYear = new Date(date).toISOString().slice(0, 7); // YYYY-MM
			if (!seenMonths.has(monthYear)) {
				seenMonths.add(monthYear);
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
					show: false
				}
			},
			colors: ['var(--color-primary-500)'],
			series: [{ name: 'Weight (kg)', data: weights }],
			xaxis: {
				categories: filteredDates,
				labels: {
					show: true,
					formatter: function (value: any) {
						if (value === '') return '';
						const date = new Date(value);
						return date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
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
				// Weight axis only
				title: {
					text: 'Weight (kg)',
					style: { color: 'var(--color-primary-500)' }
				},
				labels: {
					style: { colors: ['var(--color-primary-500)'] },
					formatter: function (value: number) {
						return value.toFixed(1) + ' kg';
					}
				}
			},
			tooltip: {
				enabled: true,
				shared: false,
				intersect: false,
				theme: 'dark',
				custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
					const date = new Date(dates[dataPointIndex]).toLocaleDateString('de-DE', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					});

					const weight = weights[dataPointIndex];
					const bodyFat = bodyFats[dataPointIndex];
					const bmi = bmis[dataPointIndex];

					return `<div class="p-3 bg-gray-800 rounded shadow-lg border border-gray-600">
						<div class="font-semibold text-white mb-2">${date}</div>
						<div class="space-y-1">
							<div class="flex items-center text-sm">
								<span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
								<span class="text-gray-300">Weight: </span>
								<span class="text-white font-medium">${weight.toFixed(1)} kg</span>
							</div>
							<div class="flex items-center text-sm">
								<span class="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
								<span class="text-gray-300">Body Fat: </span>
								<span class="text-white font-medium">${bodyFat.toFixed(1)}%</span>
							</div>
							<div class="flex items-center text-sm">
								<span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
								<span class="text-gray-300">BMI: </span>
								<span class="text-white font-medium">${bmi.toFixed(1)}</span>
							</div>
						</div>
					</div>`;
				}
			},
			stroke: {
				curve: 'smooth' as const,
				width: 3
			},
			markers: {
				size: 4,
				strokeWidth: 2,
				fillOpacity: 1,
				strokeOpacity: 1
			},
			grid: {
				borderColor: '#374151',
				strokeDashArray: 3
			},
			legend: {
				show: false
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
					series: [{ name: 'Weight (kg)', data: weights }],
					xaxis: {
						categories: filteredDates
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
	{:else}
		<div class="text-center text-gray-500 dark:text-gray-400">
			<p>No scale data available for chart</p>
			<p class="text-sm mt-2">Add some scale results to see the trends</p>
		</div>
	{/if}
</div>
