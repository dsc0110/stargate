<script lang="ts">
	let a = $state(0);
	let b = $state(0);
	let total = $state(0);

	async function add() {
		const response = await fetch('/biking', {
			method: 'POST',
			body: JSON.stringify({ a, b }),
			headers: {
				'content-type': 'application/json'
			}
		});

		total = await response.json();
	}
</script>

<svelte:head>
	<title>feed</title>
	<meta name="description" content="feed" />
</svelte:head>

<article class="h-[512px] p-4">
	<input type="number" bind:value={a} /> +
	<input type="number" bind:value={b} /> =
	{total}

	<button onclick={add}>Calculate</button>
</article>
