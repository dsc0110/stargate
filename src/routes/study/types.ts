export type StudyIndexItem = {
	filename: string;
	category?: string;
	timestamp?: string;
};

export type StudyPageResponse = {
	studyImageSrc: string | null;
	studyImageName: string | null;
	studyCardKey: string | null;
	studyCardValue: string | null;
	hasStudyCards: boolean;
	availableCategories: string[];
	selectedCategory: string;
};

export type StudyPageData = StudyPageResponse;
