<script lang="ts">
	import SlashIcon from '$lib/SlashIcon.svelte';
	import { RssIcon, DollarSign, ScaleIcon, GraduationCapIcon, BoomBoxIcon } from '@lucide/svelte';

	const linksSidebar = {
		public: [
			{ label: 'Home', href: '/', icon: SlashIcon },
			{ label: 'Feed', href: '/feed', icon: RssIcon }
		],
		private: [
			{ label: 'Portfolio', href: '/portfolio', icon: DollarSign },
			{ label: 'Scale', href: '/scale', icon: ScaleIcon },
			{ label: 'Study', href: '/study', icon: GraduationCapIcon }
		]
	};

	function closeMobileMenu() {
		const dialog = document.getElementById('mobile-menu') as HTMLDialogElement | null;
		dialog?.close();
	}
</script>

{#each Object.entries(linksSidebar) as [category, links]}
	<!-- <p>{category}</p> -->
	{#each links as link (link)}
		{@const Icon = link.icon}
		<a href={link.href} title={link.label} aria-label={link.label} class="flex items-center gap-2 p-2 rounded hover:text-primary-500" onclick={closeMobileMenu}>
			<Icon class="size-4" />
			<span>{link.label}</span>
		</a>
	{/each}
{/each}
