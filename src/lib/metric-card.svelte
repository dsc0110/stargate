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
			? 'min-w-[120px] rounded-xl border border-white/30 bg-black/10 px-3 py-1.5 backdrop-blur-md dark:border-white/20 dark:bg-white/10'
			: SHARED_STYLES.metricCard}
>
	<div class={compact || header ? 'space-y-0' : SHARED_STYLES.metricContent}>
		<p class={compact ? 'truncate text-[10px] text-secondary-600 dark:text-secondary-400' : header ? 'truncate text-xs text-secondary-600 dark:text-secondary-400' : SHARED_STYLES.metricLabel}>{label}</p>
		<h3 class={compact ? 'truncate text-sm font-bold text-gray-900 dark:text-gray-100' : header ? 'truncate text-base font-bold text-gray-900 dark:text-gray-100' : SHARED_STYLES.metricValue}>{value}</h3>
	</div>
</div>
