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

	// Always ensure we have 15 rows for consistent height
	const displayItems = $derived.by(() => {
		const items = [...paginatedPortfolioItems];
		while (items.length < PAGE_SIZE) {
			items.push(null); // Add empty rows
		}
		return items;
	});

	function formatDate(dateString: string): string {
		// Parse DD.MM.YY format manually
		const [day, month, year] = dateString.split('.');
		const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
		const date = new Date(parseInt(fullYear), parseInt(month) - 1, parseInt(day));

		const monthName = date.toLocaleString('en', { month: 'short' });
		return `${parseInt(day)}. ${monthName}. ${year}`;
	}
</script>

<div class="flex flex-col">
	<div class="flex-1">
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
				{#each displayItems as item}
					<tr>
						{#if item}
							<td class="text-xs">{formatDate(item.date)}</td>
							<td class="text-xs">{item.accounts.dkbCash}</td>
							<td class="text-xs">{item.accounts.dkbDepot}</td>
							<td class="text-xs">{item.accounts.zkbCash}</td>
						{:else}
							<td class="text-xs">&nbsp;</td>
							<td class="text-xs">&nbsp;</td>
							<td class="text-xs">&nbsp;</td>
							<td class="text-xs">&nbsp;</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="mt-4">
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
	</div>
</div>
