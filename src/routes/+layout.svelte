<script lang="ts">
	import './layout.css';
	import Navigation from './navigation.svelte';
	import SlashIcon from '$lib/slash-icon.svelte';
	import { SHARED_STYLES } from '$lib/shared-styles';
	import { Menu, SunMoon, RssIcon, DollarSign, ScaleIcon, GraduationCapIcon } from '@lucide/svelte';
	import { page } from '$app/state';
	let { children } = $props();

	function toggleTheme() {
		const html = document.documentElement;
		html.classList.toggle('dark');
	}

	function closeMobileMenu() {
		const dialog = document.getElementById('mobile-menu') as HTMLDialogElement | null;
		dialog?.close();
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
</script>

<svelte:head>
	<title>{page.url.pathname === '/' ? 'home' : page.url.pathname.slice(1)}</title>
</svelte:head>

<div class="grid h-screen grid-rows-[auto_1fr_auto]">
	<header class="sticky top-0 z-10 backdrop-blur-sm">
		<nav aria-label="Global" class="flex items-center justify-between p-4 pb-2">
			<!-- logo and path -->
			<div class="flex items-center gap-2 lg:flex-1 headertext">
				{#if page.url.pathname === '/'}
					<SlashIcon class={SHARED_STYLES.navIcon} />
				{:else if page.url.pathname === '/feed'}
					<RssIcon class={SHARED_STYLES.navIcon} />
				{:else if page.url.pathname === '/portfolio'}
					<DollarSign class={SHARED_STYLES.navIcon} />
				{:else if page.url.pathname === '/scale'}
					<ScaleIcon class={SHARED_STYLES.navIcon} />
				{:else if page.url.pathname === '/study'}
					<GraduationCapIcon class={SHARED_STYLES.navIcon} />
				{:else}
					<SlashIcon class={SHARED_STYLES.navIcon} />
				{/if}
				{#key page.url.pathname}
					<span in:typewriter={{ speed: 3 }}>{page.url.pathname == '/' ? 'home' : page.url.pathname.slice(1)}</span>
				{/key}
			</div>

			<!-- header icons -->
			<div class="flex gap-x-4">
				<button type="button" class="text-sm/6 font-semibold" aria-label="Toggle Theme" onclick={toggleTheme}><SunMoon /></button>
				<a href="https://github.com/dsc0110" class="text-sm/6 font-semibold" aria-label="Visit GitHub profile">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path
							d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
						></path>
					</svg>
				</a>
				<button type="button" command="show-modal" commandfor="mobile-menu" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 lg:hidden">
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
								{#if page.url.pathname === '/'}
									<SlashIcon class={SHARED_STYLES.navIcon} />
								{:else if page.url.pathname === '/feed'}
									<RssIcon class={SHARED_STYLES.navIcon} />
								{:else if page.url.pathname === '/portfolio'}
									<DollarSign class={SHARED_STYLES.navIcon} />
								{:else if page.url.pathname === '/scale'}
									<ScaleIcon class={SHARED_STYLES.navIcon} />
								{:else if page.url.pathname === '/study'}
									<GraduationCapIcon class={SHARED_STYLES.navIcon} />
								{:else}
									<SlashIcon class={SHARED_STYLES.navIcon} />
								{/if}
								{#if page.url.pathname !== '/'}
									<span>{page.url.pathname.slice(1)}</span>
								{:else}
									<span>home</span>
								{/if}
							</div>
							<button type="button" command="close" commandfor="mobile-menu" class="-m-2.5 rounded-md p-2.5">
								<span class="sr-only">Close menu</span>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6">
									<path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</button>
						</div>
						<div class="mt-6 flow-root">
							<div class="-my-6 divide-y divide-white/10">
								<div class="space-y-2 py-6">
									<Navigation />
								</div>
							</div>
						</div>
					</el-dialog-panel>
				</div>
			</dialog>
		</el-dialog>
	</header>

	<div class="grid grid-cols-6 gap-4">
		<main class="col-span-6 lg:col-span-5 col-start-1 p-4 pt-2">
			{@render children()}
		</main>
		<aside class="p-4 hidden lg:block">
			<Navigation />
		</aside>
	</div>
</div>
