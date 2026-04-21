// Shared style constants for portfolio components

export const SHARED_STYLES = {
	// Container styles
	container: 'preset-filled-surface-100-900 rounded-xl p-1 border border-gray-200 dark:border-gray-700',

	// Button styles
	buttonBase: 'btn rounded-lg px-3 py-2 transition-all duration-200 hover:bg-primary-100 dark:hover:bg-primary-800',
	buttonActive: 'text-primary-600 dark:text-primary-400',
	buttonInactive: 'text-gray-500 dark:text-gray-400',

	// Icon styles
	icon: 'w-4 h-4',

	// Card styles
	metricCard: 'card preset-filled-surface-50-900 p-2 md:p-4 hover:shadow-lg transition-shadow duration-200',
	metricContent: 'space-y-1',
	metricLabel: 'text-xs text-secondary-600 dark:text-secondary-400 font-medium',
	metricValue: 'text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100'
} as const;
