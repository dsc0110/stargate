import SlashIcon from '$lib/slash-icon.svelte';
import { DollarSign, GraduationCapIcon, RssIcon, ScaleIcon } from '@lucide/svelte';

export const HOME_LINK = { label: 'home', href: '/', icon: SlashIcon, private: false } as const;

export const SIDEBAR_MENU_LINKS = [
	{ label: 'feeds', href: '/feeds', icon: RssIcon, private: false },
	{ label: 'study', href: '/study', icon: GraduationCapIcon, private: false },
	{ label: 'scale', href: '/scale', icon: ScaleIcon, private: false },
	{ label: 'portfolio', href: '/portfolio', icon: DollarSign, private: true }
] as const;

export const ALL_NAV_LINKS = [HOME_LINK, ...SIDEBAR_MENU_LINKS] as const;

export function getSidebarLinkForPath(pathname: string) {
	if (pathname === '/') {
		return HOME_LINK;
	}

	const firstSegment = pathname.split('/').filter(Boolean)[0];
	const sectionPath = firstSegment ? `/${firstSegment}` : '/';
	return ALL_NAV_LINKS.find((link) => link.href === sectionPath) ?? HOME_LINK;
}
