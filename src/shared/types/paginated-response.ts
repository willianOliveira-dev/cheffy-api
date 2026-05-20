export type PaginatedResponse<T> = {
	items: T[];
	meta: {
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
};
