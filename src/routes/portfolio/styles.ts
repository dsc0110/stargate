// Shared style constants for portfolio components

export const SHARED_STYLES = {
	// Container styles
	container: 'preset-filled-surface-100-900 rounded-xl p-1 border border-gray-200 dark:border-gray-700',
	controlsContainer: 'p-2 md:p-4 rounded-xl backdrop-blur-md bg-black/10 dark:bg-white/10 border border-white/30 dark:border-white/20 shadow-lg transition-all duration-200 hover:shadow-xl hover:bg-black/15 dark:hover:bg-white/15',

	// Button styles
	buttonBase: 'btn rounded-lg px-2 py-2 transition-all duration-200 hover:bg-transparent',
	buttonActive: 'text-primary-600 dark:text-primary-400',
	buttonInactive: 'text-gray-500 dark:text-gray-400',
	buttonGrey: 'btn rounded-lg px-2 py-2 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-transparent',

	// Icon styles
	icon: 'w-6 h-6',

	// Card styles
	metricCard: 'p-2 md:p-4 rounded-xl backdrop-blur-md bg-black/10 dark:bg-white/10 border border-white/30 dark:border-white/20 shadow-lg transition-all duration-200 hover:shadow-xl hover:bg-black/15 dark:hover:bg-white/15',
	metricContent: 'space-y-1',
	metricLabel: 'text-xs text-secondary-600 dark:text-secondary-400 font-medium',
	metricValue: 'text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100'
} as const;
