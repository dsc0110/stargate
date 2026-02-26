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
<div class="flex preset-outlined-surface-200-800 p-4 mb-4 justify-between items-center">
	<p>350.000€</p>
	<div class="flex btn-group p-2 md:flex-row">
		<button type="button" class="btn capitalize" class:preset-filled={active == 'chart'} onclick={() => (active = 'chart')}><ChartLine /></button>
		<button type="button" class="btn capitalize" class:preset-filled={active == 'table'} onclick={() => (active = 'table')}><Table /></button>
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
