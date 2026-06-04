export type StudyIndexItem = {
	filename: string;
	category?: string;
	timestamp?: string;
};

export type StudyViewMode = 'pictures' | 'cards';

export type StudyPageResponse = {
	selectedViewMode: StudyViewMode;
	studyImageSrc: string | null;
	studyImageName: string | null;
	studyImageNames: string[];
	studyCardKey: string | null;
	studyCardValue: string | null;
	hasStudyCards: boolean;
	availableCategories: string[];
	categoryImageCounts: Record<string, number>;
	selectedCategory: string;
};

export type StudyPageData = StudyPageResponse;
