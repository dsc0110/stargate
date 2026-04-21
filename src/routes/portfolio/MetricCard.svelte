<script lang="ts">
	interface Props {
		label: string;
		value: string;
	}

	let { label, value }: Props = $props();

	const styles = {
		card: 'card preset-filled-surface-50-900 p-2 md:p-4 hover:shadow-lg transition-shadow duration-200',
		content: 'space-y-1',
		label: 'text-xs text-secondary-600 dark:text-secondary-400 font-medium',
		value: 'text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100'
	};
</script>

<div class={styles.card}>
	<div class={styles.content}>
		<p class={styles.label}>{label}</p>
		<h3 class={styles.value}>{value}</h3>
	</div>
</div>
