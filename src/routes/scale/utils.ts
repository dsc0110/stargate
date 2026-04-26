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

/**
 * Calculate age at a specific date
 * @param birthDate Birth date in DD.MM.YYYY format
 * @param measureDate Date of measurement (ISO string or Date object)
 * @returns Age in years
 */
export function calculateAge(birthDate: string, measureDate: string | Date): number {
	if (!birthDate) return 0;

	const birth = new Date(birthDate.split('.').reverse().join('-')); // Convert DD.MM.YYYY to YYYY-MM-DD
	const measure = typeof measureDate === 'string' ? new Date(measureDate) : measureDate;

	return Math.floor((measure.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

/**
 * Get environment values for calculations
 * @param env Environment object from platform
 * @returns Object with parsed body size and birth date
 */
export function getScaleEnvironment(env: any) {
	const bodySizeCm = parseFloat(env?.BODY_SIZE_CM || '0');
	const birthDate = env?.BIRTH_DATE || '';

	return { bodySizeCm, birthDate };
}
