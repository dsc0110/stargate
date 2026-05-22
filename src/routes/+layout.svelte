<script lang="ts">
	import './layout.css';
	import Navigation from './navigation.svelte';
	import { headerDropdown } from '$lib/header-dropdown';
	import MetricCard from '$lib/metric-card.svelte';
	import { mobileHeaderMetrics } from '$lib/mobile-header-metrics';
	import SlashIcon from '$lib/slash-icon.svelte';
	import { SHARED_STYLES } from '$lib/shared-styles';
	import { Menu, SunMoon, RssIcon, DollarSign, ScaleIcon, GraduationCapIcon } from '@lucide/svelte';
	import { page } from '$app/state';
	let { children, data } = $props();
	let isHeaderDropdownOpen = $state(false);

	const headerLinks = [
		{ label: 'home', href: '/', icon: SlashIcon, private: false },
		{ label: 'feeds', href: '/feeds', icon: RssIcon, private: false },
		{ label: 'study', href: '/study', icon: GraduationCapIcon, private: false },
		{ label: 'scale', href: '/scale', icon: ScaleIcon, private: false },
		{ label: 'portfolio', href: '/portfolio', icon: DollarSign, private: true }
	];

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

	const headerDropdownTriggerClass = $derived(`${SHARED_STYLES.headerDropdownTrigger} ${isHeaderDropdownOpen || $headerDropdown.selectedValue ? 'text-primary-800 dark:text-primary-300' : 'text-gray-800 dark:text-gray-100'}`);
</script>

<svelte:head>
	<title>{page.url.pathname === '/' ? 'home' : page.url.pathname.slice(1)}</title>
</svelte:head>

<div class="grid h-screen grid-rows-[auto_1fr_auto]">
	<header class="sticky top-0 z-10 backdrop-blur-sm">
		<nav aria-label="Global" class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pb-2 pt-4 sm:px-8 sm:pb-4 sm:pt-6">
			<!-- logo and path -->
			<div class="flex min-w-0 items-center gap-2 sm:flex-1 sm:gap-4">
				{#if $mobileHeaderMetrics.length > 0}
					<div class="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pr-2 sm:hidden">
						{#each $mobileHeaderMetrics as metric (metric.label)}
							<MetricCard label={metric.label} value={metric.value} compact />
						{/each}
					</div>
					<div class="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-2 sm:flex">
						{#each $mobileHeaderMetrics as metric (metric.label)}
							<MetricCard label={metric.label} value={metric.value} header />
						{/each}
					</div>
				{:else if $headerDropdown.enabled}
					<div class="relative header-dropdown-container min-w-0">
						<button class={headerDropdownTriggerClass} type="button" onclick={() => (isHeaderDropdownOpen = !isHeaderDropdownOpen)}>
							<span class="truncate">{$headerDropdown.selectedLabel || $headerDropdown.placeholder}</span>
							<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
							</svg>
						</button>

						{#if isHeaderDropdownOpen}
							<div class={SHARED_STYLES.headerDropdownMenu}>
								<div class="max-h-64 overflow-y-auto p-2">
									{#each $headerDropdown.options as option (option.value)}
										<button class={`${SHARED_STYLES.headerDropdownItem} cursor-pointer`} type="button" onclick={() => selectHeaderDropdownOption(option.value)}>
											<span>{option.label}</span>
											{#if $headerDropdown.selectedValue === option.value}
												<svg class="ml-auto h-3.5 w-3.5 text-primary-700 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
												</svg>
											{/if}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- header icons -->
			<div class="flex gap-x-2 sm:gap-x-5">
				<div class="hidden items-center gap-x-4 sm:flex">
					{#each headerLinks as link (link.href)}
						{#if !link.private || data.isPrivateAccessAllowed}
							{@const Icon = link.icon}
							{@const isActive = page.url.pathname === link.href}
							<a href={link.href} aria-label={link.label} title={link.label} class={SHARED_STYLES.buttonHeaderIcon + ` ${isActive ? 'text-tertiary-600' : ''}`}>
								<Icon class={SHARED_STYLES.icon} />
							</a>
						{/if}
					{/each}
				</div>
				<button type="button" class={SHARED_STYLES.buttonHeaderIcon} aria-label="Toggle Theme" onclick={toggleTheme}><SunMoon /></button>
				<a href="https://github.com/dsc0110" class={SHARED_STYLES.buttonHeaderIcon} aria-label="Visit GitHub profile">
					<svg class={SHARED_STYLES.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path
							d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
						></path>
					</svg>
				</a>
				<button type="button" command="show-modal" commandfor="mobile-menu" class={SHARED_STYLES.buttonIcon + ' sm:hidden'}>
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
							<div class="headertext flex items-center gap-2 sm:flex-1">
								{#if page.url.pathname === '/'}
									<SlashIcon class={SHARED_STYLES.navIcon + ' sm:hidden'} />
								{:else if page.url.pathname === '/feeds'}
									<RssIcon class={SHARED_STYLES.navIcon + ' sm:hidden'} />
								{:else if page.url.pathname === '/portfolio'}
									<DollarSign class={SHARED_STYLES.navIcon + ' sm:hidden'} />
								{:else if page.url.pathname === '/scale'}
									<ScaleIcon class={SHARED_STYLES.navIcon + ' sm:hidden'} />
								{:else if page.url.pathname === '/study'}
									<GraduationCapIcon class={SHARED_STYLES.navIcon + ' sm:hidden'} />
								{:else}
									<SlashIcon class={SHARED_STYLES.navIcon + ' sm:hidden'} />
								{/if}
								<span>{page.url.pathname === '/' ? 'home' : page.url.pathname.slice(1)}</span>
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

	<div class="mx-auto w-full max-w-6xl px-4 pb-4 pt-2 sm:px-8">
		<main>
			{@render children()}
		</main>
	</div>
</div>
