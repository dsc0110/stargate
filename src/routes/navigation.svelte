<script lang="ts">
	import SlashIcon from '$lib/slash-icon.svelte';
	import { RssIcon, DollarSign, ScaleIcon, GraduationCapIcon } from '@lucide/svelte';
	import { page } from '$app/state';
	let { isPrivateAccessAllowed = false, myDomain = '' } = $props();

	const linksSidebar = {
		public: [
			{ label: 'home', href: '/', icon: SlashIcon },
			{ label: 'feeds', href: '/feeds', icon: RssIcon },
			{ label: 'study', href: '/study', icon: GraduationCapIcon },
			{ label: 'scale', href: '/scale', icon: ScaleIcon }
		],
		private: [{ label: 'portfolio', href: '/portfolio', icon: DollarSign }]
	};

	function closeMobileMenu() {
		const dialog = document.getElementById('mobile-menu') as HTMLDialogElement | null;
		dialog?.close();
	}
</script>

{#each Object.entries(linksSidebar) as [category, links]}
	{#if category === 'private' && !isPrivateAccessAllowed}
		<!-- Private links hidden when not authorized -->
	{:else}
		<!-- <p>{category}</p> -->
		{#each links as link (link)}
			{@const Icon = link.icon}
			{@const isActive = page.url.pathname === link.href}
			<a href={link.href} title={link.label} aria-label={link.label} class="my-1.5 flex w-full items-center gap-4 rounded-lg px-7 py-4 text-xl {isActive ? 'text-tertiary-600' : 'hover:text-tertiary-600'}" onclick={closeMobileMenu}>
				<span class="w-24 shrink-0 text-base opacity-75">&lt;{category}&gt;</span>
				<span class="inline-flex items-center gap-2">
					<Icon class="size-6" />
					<span>{link.label}</span>
				</span>
			</a>
		{/each}
	{/if}
{/each}
