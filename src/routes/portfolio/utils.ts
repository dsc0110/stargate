// Utility functions for portfolio component
import { SHARED_STYLES } from './styles.js';

/**
 * Get button classes based on active state
 */
export function getButtonClasses(isActive: boolean): string {
	return `${SHARED_STYLES.buttonBase} ${isActive ? SHARED_STYLES.buttonActive : SHARED_STYLES.buttonInactive}`;
}

/**
 * Validate tab ID exists in configuration
 */
export function isValidTabId(tabs: any[], tabId: string): boolean {
	return tabs.some((tab) => tab.id === tabId);
}
