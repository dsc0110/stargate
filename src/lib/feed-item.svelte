<script>
	import { SHARED_STYLES } from './shared-styles.ts';

	const { item, feedName } = $props();
</script>

<div
	id="feeditem"
	class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-2 hover:shadow-md hover:bg-gray-50/800 dark:hover:bg-gray-800/50 transition-shadow cursor-pointer"
	onclick={() => window.open(item.link, '_blank')}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			window.open(item.link, '_blank');
		}
	}}
	tabindex="0"
	role="button"
	aria-label="Open {item.title} in new tab"
>
	<div class="flex items-start justify-between gap-3">
		<h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed flex-1 min-w-0">
			{item.title}
		</h3>
		<div class="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
			<span class={`${SHARED_STYLES.badge} ${SHARED_STYLES.badgeSource}`}>
				{feedName}
			</span>
			{#if item.pubDate}
				<span class={`${SHARED_STYLES.badge} ${SHARED_STYLES.badgeDate}`}>
					{new Date(item.pubDate).toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric'
					})}
					{new Date(item.pubDate).toLocaleTimeString('en-US', {
						hour: '2-digit',
						minute: '2-digit',
						hour12: false
					})}
				</span>
			{/if}
		</div>
	</div>
</div>
