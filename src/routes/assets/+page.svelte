<script lang="ts">
	import AssetsTable from './table.svelte';
	import AssetsChart from './chart.svelte';
	import AddAsset from './add.svelte';
	import { Table, ChartLine, Wallet, Target, TrendingUp } from '@lucide/svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let active = $state('table');

	let assets = $derived(data.assets);
	$inspect(assets).with(console.trace);
</script>

<svelte:head>
	<title>assets</title>
	<meta name="description" content="assets" />
</svelte:head>

<!-- <SubHeader /> -->
<div id="subheader" class="mb-6">
	<!-- Metrics Cards -->
	<div class="grid grid-cols-3 gap-2 md:gap-4 mb-6">
		<div class="card preset-filled-surface-50-900 p-2 md:p-4 hover:shadow-lg transition-shadow duration-200">
			<div class="space-y-1">
				<h3 class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">350.781€</h3>
				<p class="text-xs text-secondary-600 dark:text-secondary-400 font-medium">Current Portfolio Value</p>
			</div>
		</div>

		<div class="card preset-filled-surface-50-900 p-2 md:p-4 hover:shadow-lg transition-shadow duration-200">
			<div class="space-y-1">
				<h3 class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">1M€</h3>
				<p class="text-xs text-secondary-600 dark:text-secondary-400 font-medium">Target by January 2035</p>
			</div>
		</div>

		<div class="card preset-filled-surface-50-900 p-2 md:p-4 hover:shadow-lg transition-shadow duration-200">
			<div class="space-y-1">
				<h3 class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">+100k€</h3>
				<p class="text-xs text-secondary-600 dark:text-secondary-400 font-medium">Year over Year Growth</p>
			</div>
		</div>
	</div>

	<!-- Controls Section -->
	<div class="flex justify-between items-center gap-4">
		<div class="flex items-center space-x-4">
			<div class="preset-filled-surface-100-900 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
				<div class="flex">
					<button
						type="button"
						class="btn rounded-lg px-3 py-2 transition-all duration-200"
						class:preset-filled={active == 'chart'}
						class:text-primary-600={active == 'chart'}
						class:bg-primary-50={active == 'chart'}
						class:dark:bg-primary-900={active == 'chart'}
						class:dark:text-primary-400={active == 'chart'}
						class:text-gray-600={active != 'chart'}
						class:hover:bg-gray-100={active != 'chart'}
						class:dark:hover:bg-gray-800={active != 'chart'}
						onclick={() => (active = 'chart')}
					>
						<ChartLine class="w-4 h-4" />
					</button>
					<button
						type="button"
						class="btn rounded-lg px-3 py-2 transition-all duration-200"
						class:preset-filled={active == 'table'}
						class:text-primary-600={active == 'table'}
						class:bg-primary-50={active == 'table'}
						class:dark:bg-primary-900={active == 'table'}
						class:dark:text-primary-400={active == 'table'}
						class:text-gray-600={active != 'table'}
						class:hover:bg-gray-100={active != 'table'}
						class:dark:hover:bg-gray-800={active != 'table'}
						onclick={() => (active = 'table')}
					>
						<Table class="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
		<AddAsset />
	</div>
</div>

<!-- Chart  -->
{#if active == 'chart'}
	<AssetsChart />
{/if}

<!-- Table  -->
{#if active == 'table'}
	<AssetsTable {assets} />
{/if}
