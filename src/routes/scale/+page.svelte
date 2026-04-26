<script lang="ts">
	import ScaleTable from './scale-table.svelte';
	let scaleResults = $state<any[]>([]);
</script>

<svelte:head>
	<title>scale</title>
	<meta name="description" content="scale" />
</svelte:head>

<ScaleTable {scaleResults} />
