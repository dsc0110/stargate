<script lang="ts">
	import { page } from '$app/state';
	import { SIDEBAR_MENU_LINKS } from './sidebar-links';
	let { isPrivateAccessAllowed = false, myDomain = '' } = $props();

	function closeMobileMenu() {
		const dialog = document.getElementById('mobile-menu') as HTMLDialogElement | null;
		dialog?.close();
	}
</script>

{#each SIDEBAR_MENU_LINKS as link (link.href)}
	{#if !link.private || isPrivateAccessAllowed}
		{@const Icon = link.icon}
		{@const isActive = page.url.pathname === link.href}
		<a href={link.href} title={link.label} aria-label={link.label} class="flex w-full items-center justify-start gap-3 rounded-lg py-4 pr-4 text-2xl font-semibold" onclick={closeMobileMenu}>
			<Icon class="size-7 shrink-0 {isActive ? 'text-tertiary-600' : ''}" />
			<span>{link.label}</span>
		</a>
	{/if}
{/each}
