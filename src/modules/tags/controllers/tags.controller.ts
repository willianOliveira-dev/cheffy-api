import { TagsRepository } from '../repositories/tags.repository.js';
import type { CreateTagDto } from '../schemas/dtos/create-tag.dto.js';
import type { FindAllTagsDto } from '../schemas/dtos/find-all-tags.dto.js';
import type { UpdateTagDto } from '../schemas/dtos/update-tag.dto.js';
import { TagsService } from '../services/tags.service.js';

const repository = new TagsRepository();
export const tagsService = new TagsService(repository);

export class TagsController {
	constructor(private readonly service: TagsService) {}

	async create(data: CreateTagDto): ReturnType<TagsService['create']> {
		return await this.service.create(data);
	}

	async getAll(filters: FindAllTagsDto): ReturnType<TagsService['getAll']> {
		return await this.service.getAll(filters);
	}

	async getById(id: string): ReturnType<TagsService['getById']> {
		return await this.service.getById(id);
	}

	async getBySlug(slug: string): ReturnType<TagsService['getBySlug']> {
		return await this.service.getBySlug(slug);
	}

	async update(id: string, data: UpdateTagDto): ReturnType<TagsService['update']> {
		return await this.service.update(id, data);
	}

	async delete(id: string): ReturnType<TagsService['delete']> {
		return await this.service.delete(id);
	}
}

export const tagsController = new TagsController(tagsService);
