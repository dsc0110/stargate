<script lang="ts">
	import { SHARED_STYLES } from '$lib/shared-styles';
	import type { PortfolioMetric } from './index.js';

	interface Props extends PortfolioMetric {}

	let { label, value }: Props = $props();
</script>

<div class={SHARED_STYLES.metricCard}>
	<div class={SHARED_STYLES.metricContent}>
		<p class={SHARED_STYLES.metricLabel}>{label}</p>
		<h3 class={SHARED_STYLES.metricValue}>{value}</h3>
	</div>
</div>
