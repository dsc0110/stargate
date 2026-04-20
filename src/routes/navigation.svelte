<script lang="ts">
	import { LogIn, BikeIcon, DollarSign, PopcornIcon, SailboatIcon } from '@lucide/svelte';

	const linksSidebar = {
		public: [
			// { label: 'Login', href: '/#', icon: LogIn },
			{ label: 'Portfolio', href: '/portfolio', icon: DollarSign },
			{ label: 'Movies', href: '/movies', icon: PopcornIcon },
			{ label: 'Biking', href: '/biking', icon: BikeIcon }
		],
		private: [{ label: 'Sailing', href: '/sailing', icon: SailboatIcon }]
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
