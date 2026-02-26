<script lang="ts">
	import ApexCharts from 'apexcharts';
	import { onMount } from 'svelte';

	let chart;

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
			// title: {
			// 	text: '$235,312',
			// 	offsetX: 0,
			// 	style: {
			// 		fontSize: '24px'
			// 	}
			// },
			// subtitle: {
			// 	text: 'Assets',
			// 	offsetX: 0,
			// 	style: {
			// 		fontSize: '14px'
			// 	}
			// },
			series: [{ name: 'sum', data: [30, 40, 35, 50, 49, 60, 70, 91, 125] }],
			xaxis: { categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999] },
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
					format: 'dd MMM',
					formatter: undefined
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
		chart = new ApexCharts(document.querySelector('#assets-chart'), options);
		chart.render();
	});
</script>

<div id="assets-chart"></div>
