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
<div class="flex p-4 mb-4 justify-between items-center">

	<div class="card preset-filled-surface-100-900 p-4 text-center">
		<span class="text-2xl">350.781€</span>
		<p class="text-primary-500">current</p>
	</div>

	<div class="card preset-filled-surface-100-900 p-4 text-center">
		<span class="text-2xl">January 2035</span>
		<p class="text-primary-500">millionaire date</p>
	</div>

	<div class="card preset-filled-surface-100-900 p-4 text-center">
		<span class="text-2xl">100k€</span>
		<p class="text-primary-500">y2y</p>
	</div>

	<div class="card preset-filled-surface-100-900 p-4 text-center">
		<div class="flex btn-group p-2 md:flex-row">
			<button type="button" class="btn capitalize" class:preset-filled={active == 'chart'} onclick={() => (active = 'chart')}><ChartLine /></button>
			<button type="button" class="btn capitalize" class:preset-filled={active == 'table'} onclick={() => (active = 'table')}><Table /></button>
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
