<script lang="ts">
	import './layout.css';
	import { blur, crossfade, draw, fade, fly, scale, slide } from 'svelte/transition';
	import favicon from '$lib/images/favicon.svg';
	import Navigation from './navigation.svelte';
	import { Menu, SunMoon, Github } from '@lucide/svelte';
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
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="grid h-screen grid-rows-[auto_1fr_auto]">
	<header class="sticky top-0 z-10 backdrop-blur-sm">
		<nav aria-label="Global" class="flex items-center justify-between p-4">
			<!-- logo and path -->
			<div class="flex lg:flex-1 headertext">
				<a href="/" class="text-primary-600 hover:text-primary-500">
					<span>/</span>
				</a>
				{#key page.url.pathname}
					<span in:typewriter={{ speed: 3 }}>{page.url.pathname == '/' ? '' : page.url.pathname.slice(1)}</span>
				{/key}
			</div>

			<!-- header icons -->
			<div class="flex gap-x-4">
				<button type="button" class="text-sm/6 font-semibold" aria-label="Toggle Theme" onclick={toggleTheme}><SunMoon /></button>
				<a href="https://github.com/dsc0110" class="text-sm/6 font-semibold"><Github /></a>
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
					<el-dialog-panel class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto backdrop-blur-sm p-4 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
						<div class="flex items-center justify-between">
							<div class="flex lg:flex-1 headertext">
								<a href="/" class="text-primary-600 hover:text-primary-500" onclick={closeMobileMenu}>
									<span>/</span>
								</a>
								{#if page.url.pathname !== '/'}
									<span>{page.url.pathname.slice(1)}</span>
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
		<main class="col-span-6 lg:col-span-5 col-start-1 p-4 space-y-4">
			{@render children()}
		</main>
		<aside class="p-4 hidden lg:block">
			<Navigation />
		</aside>
	</div>
</div>
