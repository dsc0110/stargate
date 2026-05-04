<script lang="ts">
	import SlashIcon from '$lib/slash-icon.svelte';
	import { Newspaper, RssIcon, DollarSign, ScaleIcon, GraduationCapIcon } from '@lucide/svelte';

	const linksSidebar = {
		public: [
			{ label: 'home', href: '/', icon: SlashIcon },
			{ label: 'news', href: '/news', icon: Newspaper }
			// { label: 'blogs', href: '/blogs', icon: RssIcon }
		],
		private: [
			{ label: 'portfolio', href: '/portfolio', icon: DollarSign },
			{ label: 'scale', href: '/scale', icon: ScaleIcon },
			{ label: 'study', href: '/study', icon: GraduationCapIcon }
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
