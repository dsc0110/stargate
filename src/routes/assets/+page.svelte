<script lang="ts">
	import AssetsTable from './table.svelte';
	import AssetsChart from './chart.svelte';
	import AddAsset from './add.svelte';
	import { Table, ChartLine } from '@lucide/svelte';
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
<div id="subheader" class="flex flex-wrap lg:flex-nowrap p-4 mb-4 justify-between items-center gap-4">
	<!-- Cards Container -->
	<div class="flex w-full lg:w-auto gap-4 justify-between lg:justify-start">
		<div class="card preset-filled-surface-100-900 p-4 text-center">
			<span class="text-l">350.781€</span>
			<p class="text-primary-500 text-xs">current</p>
		</div>

		<div class="card preset-filled-surface-100-900 p-4 text-center">
			<span class="text-l">January 2035</span>
			<p class="text-primary-500 text-xs">millionaire date</p>
		</div>

		<div class="card preset-filled-surface-100-900 p-4 text-center">
			<span class="text-l">100k€</span>
			<p class="text-primary-500 text-xs">y2y</p>
		</div>
	</div>

	<!-- Buttons Container -->
	<div class="preset-filled-surface-100-900 p-2 lg:p-4 text-center w-full lg:w-auto">
		<div class="flex btn-group p-2 justify-between">
			<div class="flex">
				<button type="button" class="btn capitalize" class:preset-filled={active == 'chart'} onclick={() => (active = 'chart')}><ChartLine /></button>
				<button type="button" class="btn capitalize" class:preset-filled={active == 'table'} onclick={() => (active = 'table')}><Table /></button>
			</div>
			<AddAsset />
		</div>
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
