export type StudyIndexItem = {
	filename: string;
	category?: string;
	timestamp?: string;
};

export type StudyPageResponse = {
	studyImageSrc: string | null;
	studyImageName: string | null;
	studyImageNames: string[];
	availableCategories: string[];
	categoryImageCounts: Record<string, number>;
	selectedCategory: string;
};

export type StudyPageData = StudyPageResponse;
