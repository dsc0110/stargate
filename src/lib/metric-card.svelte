<script lang="ts">
	import { SHARED_STYLES } from '$lib/shared-styles';

	interface Props {
		label: string;
		value: string;
		compact?: boolean;
		header?: boolean;
	}

	let { label, value, compact = false, header = false }: Props = $props();
</script>

<div
	class={compact
		? 'min-w-[72px] rounded-lg border border-white/30 bg-black/10 px-1.5 py-1 backdrop-blur-md dark:border-white/20 dark:bg-white/10'
		: header
			? 'h-10 min-w-[104px] rounded-lg border border-white/30 bg-black/10 px-2.5 py-1 backdrop-blur-md dark:border-white/20 dark:bg-white/10'
			: SHARED_STYLES.metricCard}
>
	<div class={compact ? 'space-y-0' : header ? 'flex h-full items-center justify-between gap-2' : SHARED_STYLES.metricContent}>
		<p class={compact ? 'truncate text-[10px] text-secondary-600 dark:text-secondary-400' : header ? 'truncate text-[11px] text-secondary-600 dark:text-secondary-400' : SHARED_STYLES.metricLabel}>{label}</p>
		<h3 class={compact ? 'truncate text-sm font-bold text-gray-900 dark:text-gray-100' : header ? 'truncate text-sm font-bold text-gray-900 dark:text-gray-100' : SHARED_STYLES.metricValue}>{value}</h3>
	</div>
</div>
