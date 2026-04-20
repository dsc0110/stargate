<script lang="ts">
	import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';
	let { portfolio } = $props();
	const PAGE_SIZE = 15;
	let page = $state(1);
	const start = $derived((page - 1) * PAGE_SIZE);
	const end = $derived(start + PAGE_SIZE);
	const paginatedPortfolioItems = $derived(portfolio.slice(start, end));
</script>

<table class="table caption-bottom">
	<thead>
		<tr>
			<th>Date</th>
			<th>Cash DKB</th>
			<th>Depot DKB</th>
			<th>Cash ZKB</th>
		</tr>
	</thead>
	<tbody class="[&>tr]:hover:text-secondary-500">
		{#each paginatedPortfolioItems as item}
			<tr>
				<td>{item.date}</td>
				<td>{item.accounts.dkbCash}</td>
				<td>{item.accounts.dkbDepot}</td>
				<td>{item.accounts.zkbCash}</td>
			</tr>
		{/each}
	</tbody>
</table>

<Pagination count={portfolio.length} pageSize={PAGE_SIZE} {page} onPageChange={(event: any) => (page = event.page)}>
	<Pagination.PrevTrigger>
		<ArrowLeftIcon class="size-4" />
	</Pagination.PrevTrigger>
	<Pagination.Context>
		{#snippet children(pagination: any)}
			{#each pagination().pages as page, index (page)}
				{#if page.type === 'page'}
					<Pagination.Item {...page}>
						{page.value}
					</Pagination.Item>
				{:else}
					<Pagination.Ellipsis {index}>&#8230;</Pagination.Ellipsis>
				{/if}
			{/each}
		{/snippet}
	</Pagination.Context>
	<Pagination.NextTrigger>
		<ArrowRightIcon class="size-4" />
	</Pagination.NextTrigger>
</Pagination>
