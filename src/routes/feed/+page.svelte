<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>RSS Feed</title>
	<meta name="description" content="RSS feed display" />
</svelte:head>

<article class="min-h-[512px] p-4">
	<h1 class="text-3xl font-bold mb-6">RSS Feeds</h1>

	{#if data.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			<strong>Error:</strong>
			{data.error}
		</div>
	{:else if data.feeds}
		<div class="space-y-8">
			{#each data.feeds as feed}
				<section class="border border-gray-300 rounded-lg p-6">
					{#if feed.success && feed.title && feed.items}
						<div class="mb-6">
							<h2 class="text-2xl font-semibold text-gray-800">
								<span class="inline-flex items-center gap-2">
									<span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{feed.name}</span>
									{feed.title}
								</span>
							</h2>
							{#if feed.description}
								<p class="text-gray-600 mt-2">{feed.description}</p>
							{/if}
						</div>

						<div class="space-y-4">
							{#each feed.items.slice(0, 5) as item}
								<article class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
									<h3 class="text-lg font-medium text-blue-600 hover:text-blue-800">
										<a href={item.link} target="_blank" rel="noopener noreferrer">
											{item.title}
										</a>
									</h3>

									{#if item.contentSnippet}
										<p class="text-gray-700 mt-2 line-clamp-3">{item.contentSnippet}</p>
									{/if}

									{#if item.pubDate}
										<time class="text-sm text-gray-500 mt-2 block">
											{new Date(item.pubDate).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
												day: 'numeric'
											})}
										</time>
									{/if}
								</article>
							{/each}
						</div>
					{:else}
						<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
							<strong>Error loading {feed.name}:</strong>
							{feed.error || 'Unknown error'}
						</div>
					{/if}
				</section>
			{/each}
		</div>
	{:else}
		<div class="flex items-center justify-center h-64">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<span class="ml-3 text-gray-600">Loading feeds...</span>
		</div>
	{/if}
</article>
