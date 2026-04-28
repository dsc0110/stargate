// Shared configuration for the scale component
import { calculateBMI } from './utils.js';

export const SCALE_CONFIG = {
	// Metric labels configuration
	METRIC_LABELS: {
		WEIGHT: 'Weight',
		BMI: 'BMI',
		BODY_FAT: 'Body Fat'
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
 * Generate dynamic metrics based on scale data (using newest entry)
 */
export function generateScaleMetrics(scaleResults: any[], bodySizeCm: number) {
	try {
		// Get the newest entry (first one since data is sorted by date descending)
		const newestEntry = scaleResults[0];

		if (!newestEntry) {
			return SCALE_CONFIG.DEFAULT_METRICS;
		}

		const weight = `${newestEntry.weight} kg`;
		const bodyFat = `${newestEntry.bodyFat}%`;
		const bmi = bodySizeCm > 0 ? calculateBMI(newestEntry.weight, bodySizeCm).toString() : '0.0';

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
