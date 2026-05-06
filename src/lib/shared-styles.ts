// Shared styles for components across the application

export const SHARED_STYLES = {
	// Container styles
	container: 'preset-filled-surface-100-900 rounded-xl p-1 border border-gray-200 dark:border-gray-700',
	controlsContainer: 'p-2 md:p-4 rounded-xl bg-transparent transition-all duration-200',

	// Button styles
	buttonBase: 'btn rounded-lg px-2 py-2 transition-all duration-200 hover:bg-transparent',
	buttonActive: 'text-primary-800 dark:text-primary-400',
	buttonInactive: 'text-gray-500 dark:text-gray-400',
	buttonGrey: 'btn rounded-lg px-2 py-2 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-transparent hover:text-primary-800 dark:hover:text-primary-400',

	// Chip styles for news and other control sections
	chipBase: 'border px-3 py-1 rounded-full text-sm transition-all duration-200 hover:bg-transparent',
	chipActive: 'text-primary-800 dark:text-primary-400 bg-transparent border-primary-800 dark:border-primary-400',
	chipInactive: 'text-gray-500 dark:text-gray-400 bg-transparent border-gray-500 dark:border-gray-400 hover:text-primary-800 dark:hover:text-primary-400 hover:border-primary-800 dark:hover:border-primary-400',
	buttonIcon: 'rounded-lg p-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800',
	buttonHeaderIcon: 'inline-flex items-center justify-center text-sm/6 font-semibold transition-colors duration-200 hover:text-primary-800 dark:hover:text-primary-400',
	buttonPrimary: 'btn preset-outlined-surface-300-700',
	buttonSecondary: 'btn preset-tonal',
	buttonIconClose: 'btn-icon hover:preset-tonal',

	// Icon styles
	icon: 'w-6 h-6',
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

/**
 * Get chip classes based on active state
 */
export function getChipClasses(isActive: boolean): string {
	return `${SHARED_STYLES.chipBase} ${isActive ? SHARED_STYLES.chipActive : SHARED_STYLES.chipInactive}`;
}
