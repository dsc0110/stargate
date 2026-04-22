<script lang="ts">
	import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import { ArrowLeftIcon, ArrowRightIcon } from '@lucide/svelte';

	interface Props {
		portfolio: any[];
	}

	let { portfolio }: Props = $props();
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
			<th>DKB</th>
			<th>Depot</th>
			<th>ZKB</th>
		</tr>
	</thead>
	<tbody class="[&>tr]:hover:text-secondary-500">
		{#each paginatedPortfolioItems as item}
			<tr>
				<td class="text-xs">{item.date}</td>
				<td class="text-xs">{item.accounts.dkbCash}</td>
				<td class="text-xs">{item.accounts.dkbDepot}</td>
				<td class="text-xs">{item.accounts.zkbCash}</td>
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
