// Shared styles for components across the application

export const SHARED_STYLES = {
	// Container styles
	container: 'preset-filled-surface-100-900 rounded-xl p-1 border border-gray-200 dark:border-gray-700',
	controlsContainer: 'bg-transparent transition-all duration-200',

	// Button styles
	buttonBase: 'btn rounded-lg px-2 py-2 transition-all duration-200 hover:bg-transparent',
	buttonActive: 'text-primary-800 dark:text-primary-400',
	buttonInactive: 'text-gray-500 dark:text-gray-400',
	buttonGrey: 'btn rounded-lg px-2 py-2 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-transparent hover:text-primary-800 dark:hover:text-primary-400',

	// Chip styles for news and other control sections
	chipBase: 'border px-1.5 py-0 rounded-full text-xs transition-all duration-200 hover:bg-transparent',
	chipActive: 'text-primary-800 dark:text-primary-400 bg-transparent border-primary-800 dark:border-primary-400',
	chipInactive: 'text-gray-500 dark:text-gray-400 bg-transparent border-gray-500 dark:border-gray-400 hover:text-primary-800 dark:hover:text-primary-400 hover:border-primary-800 dark:hover:border-primary-400',
	dropdownTriggerBase: 'inline-flex items-center gap-1 border px-1.5 py-0 rounded-none text-xs leading-5 transition-all duration-200',
	dropdownMenu: 'absolute top-full left-0 mt-1 z-50 min-w-[12rem] rounded-none border border-gray-300/80 dark:border-gray-600/80 bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm shadow-lg',
	dropdownItem:
		'flex items-center gap-2 w-full px-2 py-1 rounded-none text-xs text-left transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:text-primary-800 dark:hover:text-primary-400 hover:bg-surface-100/80 dark:hover:bg-surface-800/70',
	headerDropdownTrigger:
		'inline-flex min-h-10 min-w-[13rem] items-center justify-between gap-2 rounded-xl border border-white/30 bg-black/10 px-3 py-2 text-sm font-medium text-gray-900 shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-black/15 dark:border-white/20 dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/15',
	headerDropdownMenu: 'absolute left-0 top-full z-50 mt-2 min-w-[16rem] rounded-xl border border-surface-300/90 bg-white/95 p-2 shadow-xl dark:border-surface-700/90 dark:bg-surface-900/95',
	headerDropdownItem: 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200 text-surface-900 dark:text-surface-100 hover:bg-surface-200/80 dark:hover:bg-surface-800/85',
	buttonIcon: 'rounded-lg p-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800',
	buttonHeaderIcon: 'inline-flex items-center justify-center text-sm/6 font-semibold transition-colors duration-200 hover:text-primary-800 dark:hover:text-primary-400 sm:text-base/7 sm:px-1',
	buttonPrimary: 'btn preset-outlined-surface-300-700',
	buttonSecondary: 'btn preset-tonal',
	buttonIconClose: 'btn-icon hover:preset-tonal',

	// Icon styles
	icon: 'h-6 w-6 sm:h-7 sm:w-7',
	navIcon: 'size-7 text-tertiary-600',

	// Card styles
	metricCard: 'p-2 md:p-4 rounded-xl backdrop-blur-md bg-black/10 dark:bg-white/10 border border-white/30 dark:border-white/20 shadow-lg transition-all duration-200 hover:shadow-xl hover:bg-black/15 dark:hover:bg-white/15',
	metricContent: 'space-y-1',
	metricLabel: 'text-xs text-secondary-600 dark:text-secondary-400 font-medium',
	metricValue: 'text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100',

	// Badge styles
	badge: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
	badgeSource: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
	badgeDate: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
} as const;

/**
 * Get button classes based on active state
 */
export function getButtonClasses(isActive: boolean): string {
	return `${SHARED_STYLES.buttonBase} ${isActive ? SHARED_STYLES.buttonActive : SHARED_STYLES.buttonInactive}`;
}
