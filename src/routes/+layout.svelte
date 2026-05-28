<script lang="ts">
	import './layout.css';
	import Navigation from './navigation.svelte';
	import { headerDropdown } from '$lib/header-dropdown';
	import { SHARED_STYLES } from '$lib/shared-styles';
	import { Menu, SunMoon } from '@lucide/svelte';
	import { ALL_NAV_LINKS, HOME_LINK, getSidebarLinkForPath } from './sidebar-links';
	import { page } from '$app/state';
	let { children, data } = $props();
	let isHeaderDropdownOpen = $state(false);

	function toggleTheme() {
		const html = document.documentElement;
		html.classList.toggle('dark');
	}

	function closeMobileMenu() {
		const dialog = document.getElementById('mobile-menu') as HTMLDialogElement | null;
		dialog?.close();
	}

	function selectHeaderDropdownOption(value: string) {
		headerDropdown.update((current) => {
			current.onSelect?.(value);
			return current;
		});
		isHeaderDropdownOpen = false;
	}

	function handleHeaderDropdownOutsideClick(event: Event) {
		const target = event.target as Element;
		if (!target.closest('.header-dropdown-container')) {
			isHeaderDropdownOpen = false;
		}
	}

	export function typewriter(node: Element, { speed = 1 }: { speed?: number } = {}) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}

		const text = node.textContent ?? '';
		const duration = text.length / (speed * 0.01);

		return {
			duration,
			tick: (t: number) => {
				const i = Math.trunc(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}

	$effect(() => {
		if (isHeaderDropdownOpen) {
			document.addEventListener('click', handleHeaderDropdownOutsideClick);
		} else {
			document.removeEventListener('click', handleHeaderDropdownOutsideClick);
		}

		return () => {
			document.removeEventListener('click', handleHeaderDropdownOutsideClick);
		};
	});

	$effect(() => {
		page.url.pathname;
		isHeaderDropdownOpen = false;
	});

	const currentHeaderLink = $derived(getSidebarLinkForPath(page.url.pathname));
	const CurrentPageIcon = $derived(currentHeaderLink.icon);
	const pageTitle = $derived(currentHeaderLink.label);
</script>

<svelte:head>
	<title>{data.myDomain || ''}</title>
</svelte:head>

<div class="grid h-screen grid-rows-[auto_1fr_auto]">
	<header class="sticky top-0 z-10 backdrop-blur-sm">
		<nav aria-label="Global" class="mx-auto flex w-full max-w-5xl items-center justify-between px-4 pb-2 pt-4 lg:px-8">
			<!-- logo and path -->
			<div class="flex items-center gap-2 lg:flex-1 headertext">
				<span aria-hidden="true" class="inline-flex items-center">
					<CurrentPageIcon class={SHARED_STYLES.navIcon} />
				</span>
				{#if $headerDropdown.enabled}
					<div class="relative header-dropdown-container min-w-0">
						<button class={SHARED_STYLES.headerDropdownTrigger} type="button" onclick={() => (isHeaderDropdownOpen = !isHeaderDropdownOpen)}>
							<span class="truncate">{$headerDropdown.selectedLabel || $headerDropdown.placeholder}</span>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
							</svg>
						</button>

						{#if isHeaderDropdownOpen}
							<div class={SHARED_STYLES.headerDropdownMenu}>
								<div class="max-h-64 overflow-y-auto p-2">
									{#each $headerDropdown.options as option (option.value)}
										<button class={SHARED_STYLES.headerDropdownItem} type="button" onclick={() => selectHeaderDropdownOption(option.value)}>
											<span>{option.label}</span>
											{#if $headerDropdown.selectedValue === option.value}
												<svg class="ml-auto h-5 w-5 text-primary-700 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
												</svg>
											{/if}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<div class="min-h-[1em] min-w-[4ch]">
						{#if pageTitle}
							{#key page.url.pathname}
								<span in:typewriter={{ speed: 3 }}>{pageTitle}</span>
							{/key}
						{:else}
							<span class="select-none opacity-0" aria-hidden="true">home</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- header icons -->
			<div class="flex gap-x-4">
				<div class="hidden items-center gap-x-4 lg:flex">
					{#each ALL_NAV_LINKS as link (link.href)}
						{#if !link.private || data.isPrivateAccessAllowed}
							{@const Icon = link.icon}
							{@const isActive = page.url.pathname === link.href}
							<a href={link.href} aria-label={link.label} title={link.label} class={SHARED_STYLES.buttonHeaderIcon}>
								<Icon class={`${SHARED_STYLES.icon} ${isActive ? 'text-tertiary-600' : ''}`} />
							</a>
						{/if}
					{/each}
				</div>
				<button type="button" class={SHARED_STYLES.buttonHeaderIcon} aria-label="Toggle Theme" onclick={toggleTheme}><SunMoon /></button>
				<a href="https://github.com/dsc0110" class={SHARED_STYLES.buttonHeaderIcon} aria-label="Visit GitHub profile" target="_blank" rel="noopener noreferrer">
					<svg class={SHARED_STYLES.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path
							d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
						></path>
					</svg>
				</a>
				<button type="button" command="show-modal" commandfor="mobile-menu" class={SHARED_STYLES.buttonIcon + ' lg:hidden'}>
					<span class="sr-only">Open main menu</span>
					<Menu />
				</button>
			</div>
		</nav>

		<!-- mobile menu -->
		<el-dialog>
			<dialog id="mobile-menu" class="backdrop:bg-transparent">
				<div tabindex="-1" class="fixed inset-0 focus:outline-none">
					<el-dialog-panel class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto backdrop-blur-sm p-4 sm:ring-1 sm:ring-gray-100/10">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2 lg:flex-1 headertext">
								<a href={HOME_LINK.href} aria-label="Go to home" title={HOME_LINK.label} class="inline-flex items-center gap-2 no-underline text-inherit" onclick={closeMobileMenu}>
									<HOME_LINK.icon class={`${SHARED_STYLES.navIcon} ${page.url.pathname === HOME_LINK.href ? '!text-tertiary-600' : '!text-gray-800 dark:!text-gray-100'}`} />
									<span>{HOME_LINK.label}</span>
								</a>
							</div>
							<button type="button" command="close" commandfor="mobile-menu" class={SHARED_STYLES.buttonIcon}>
								<span class="sr-only">Close menu</span>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6">
									<path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</button>
						</div>
						<div class="mt-6 flow-root">
							<div class="-my-6 divide-y divide-white/10">
								<div class="space-y-2 py-6">
									<Navigation isPrivateAccessAllowed={data.isPrivateAccessAllowed} myDomain={data.myDomain} />
								</div>
							</div>
						</div>
					</el-dialog-panel>
				</div>
			</dialog>
		</el-dialog>
	</header>

	<div class="mx-auto w-full max-w-5xl px-2 lg:px-8">
		<main class="pt-2">
			{@render children()}
		</main>
	</div>
</div>
