// Scale calculation utilities

/**
 * Calculate BMI from weight and height
 * @param weight Weight in kilograms
 * @param heightCm Height in centimeters
 * @returns BMI rounded to 1 decimal place
 */
export function calculateBMI(weight: number, heightCm: number): number {
	const heightInMeters = heightCm / 100;
	const bmi = weight / (heightInMeters * heightInMeters);
	return Math.round(bmi * 10) / 10;
}
