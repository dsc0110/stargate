// Type definitions for portfolio components

export interface PortfolioMetric {
	label: string;
	value: string;
}

export interface PortfolioTab {
	id: string;
	icon: any;
}

export interface PortfolioData {
	portfolio: any[];
}

export interface PortfolioProps {
	data: PortfolioData;
}
