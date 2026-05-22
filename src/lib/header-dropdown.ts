import { writable } from 'svelte/store';

export interface HeaderDropdownOption {
	value: string;
	label: string;
}

export interface HeaderDropdownState {
	enabled: boolean;
	placeholder: string;
	selectedValue: string;
	selectedLabel: string;
	options: HeaderDropdownOption[];
	onSelect?: (value: string) => void;
}

export const headerDropdown = writable<HeaderDropdownState>({
	enabled: false,
	placeholder: 'Select...',
	selectedValue: '',
	selectedLabel: '',
	options: []
});
