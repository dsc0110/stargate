import { writable } from 'svelte/store';

export interface HeaderMetric {
	label: string;
	value: string;
}

export const mobileHeaderMetrics = writable<HeaderMetric[]>([]);
