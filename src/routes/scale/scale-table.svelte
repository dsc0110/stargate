<script lang="ts">
	import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';

	interface Props {
		scaleResults: any[];
	}

	let { scaleResults }: Props = $props();
	const PAGE_SIZE = 15;
	let page = $state(1);
	const start = $derived((page - 1) * PAGE_SIZE);
	const end = $derived(start + PAGE_SIZE);
	const paginatedScaleResult = $derived(scaleResults.slice(start, end));

	// Always ensure we have 15 rows for consistent height
	const displayItems = $derived.by(() => {
		const items = [...paginatedScaleResult];
		while (items.length < PAGE_SIZE) {
			items.push(null); // Add empty rows
		}
		return items;
	});

	function formatDate(dateString: string): string {
		// Parse YYYY-MM-DD ISO format
		const date = new Date(dateString);
		const day = date.getDate();
		const monthName = date.toLocaleString('en', { month: 'short' });
		const year = date.getFullYear().toString().slice(-2);
		return `${day}. ${monthName}. ${year}`;
	}
</script>

<div class="flex flex-col">
	<div class="flex-1">
		<table class="table caption-bottom">
			<thead>
				<tr>
					<th>Date</th>
					<th>Weight</th>
					<th>BMI</th>
					<th>Bodyfat</th>
				</tr>
			</thead>
			<tbody class="[&>tr]:hover:text-secondary-500">
				{#each displayItems as item}
					<tr>
						{#if item}
							<td class="text-xs">{formatDate(item.date)}</td>
							<td class="text-xs">{item.accounts.weight}</td>
							<td class="text-xs">{item.accounts.bmi}</td>
							<td class="text-xs">{item.accounts.bodyFat}</td>
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
		<Pagination count={scaleResults.length} pageSize={PAGE_SIZE} {page} onPageChange={(event: any) => (page = event.page)}>
			<Pagination.PrevTrigger>
				<ArrowLeft class="size-4" />
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
				<ArrowRight class="size-4" />
			</Pagination.NextTrigger>
		</Pagination>
	</div>
</div>
