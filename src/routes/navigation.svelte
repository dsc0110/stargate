<script lang="ts">
	import { RssIcon, DollarSign, ScaleIcon, GraduationCapIcon } from '@lucide/svelte';
	import { page } from '$app/state';
	let { isPrivateAccessAllowed = false, myDomain = '' } = $props();

	const linksSidebar = {
		public: [
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
			<a
				href={link.href}
				title={link.label}
				aria-label={link.label}
				class="mx-auto flex w-full max-w-sm items-center justify-start gap-3 rounded-lg px-4 py-4 text-2xl font-semibold {isActive ? 'text-tertiary-600' : 'hover:text-tertiary-600'}"
				onclick={closeMobileMenu}
			>
				<Icon class="size-7 shrink-0" />
				<span>{link.label}</span>
			</a>
		{/each}
	{/if}
{/each}
