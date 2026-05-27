// Shared configuration for the scale component
import { calculateBMI } from './utils.js';

export const SCALE_CONFIG = {
	// Metric labels configuration
	METRIC_LABELS: {
		WEIGHT: 'Ø Weight',
		BMI: 'Ø BMI',
		BODY_FAT: 'Ø Body Fat'
	},

	// Static metrics for fallback
	get DEFAULT_METRICS() {
		return [
			{ label: this.METRIC_LABELS.WEIGHT, value: '0 kg' },
			{ label: this.METRIC_LABELS.BMI, value: '0.0' },
			{ label: this.METRIC_LABELS.BODY_FAT, value: '0%' }
		];
	}
};

/**
 * Generate dynamic metrics based on scale data averages from the last 12 months.
 */
export function generateScaleMetrics(scaleResults: any[], bodySizeCm: number) {
	try {
		const now = new Date();
		const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());

		const recentResults = scaleResults.filter((entry) => {
			const entryDate = new Date(entry.date);
			return entryDate >= twelveMonthsAgo && entryDate <= now;
		});

		if (recentResults.length === 0) {
			return SCALE_CONFIG.DEFAULT_METRICS;
		}

		const avgWeight = recentResults.reduce((sum, entry) => sum + entry.weight, 0) / recentResults.length;
		const weight = `${avgWeight.toFixed(1)} kg`;

		const recentBodyFats = recentResults
			.map((entry) => entry.bodyFat)
			.filter((bodyFat) => bodyFat != null);
		const bodyFat =
			recentBodyFats.length === 0
				? '-'
				: `${(recentBodyFats.reduce((sum, value) => sum + value, 0) / recentBodyFats.length).toFixed(1)}%`;

		const bmi = bodySizeCm > 0 ? calculateBMI(avgWeight, bodySizeCm).toString() : '0.0';

		return [
			{ label: SCALE_CONFIG.METRIC_LABELS.WEIGHT, value: weight },
			{ label: SCALE_CONFIG.METRIC_LABELS.BMI, value: bmi },
			{ label: SCALE_CONFIG.METRIC_LABELS.BODY_FAT, value: bodyFat }
		];
	} catch (error) {
		console.error('Error calculating scale metrics:', error);
		return SCALE_CONFIG.DEFAULT_METRICS;
	}
}
