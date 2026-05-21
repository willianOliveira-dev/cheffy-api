import type { Tag } from '@prisma/client';
import { prisma } from '@/lib/db/prisma.js';
import { ConflictError, NotFoundError } from '@/shared/errors/app.error.js';
import { generateUniqueSlug } from '@/shared/utils/slug.util.js';
import type { TagsRepository } from '../repositories/tags.repository.js';
import type { CreateTagDto } from '../schemas/dtos/create-tag.dto.js';
import type { FindAllTagsDto } from '../schemas/dtos/find-all-tags.dto.js';
import type { UpdateTagDto } from '../schemas/dtos/update-tag.dto.js';

export class TagsService {
	constructor(private readonly repository: TagsRepository) {}

	async create(dto: CreateTagDto): Promise<Tag> {
		const existing = await this.repository.findByName(dto.name);
		if (existing) {
			throw new ConflictError('JÃ¡ existe uma tag cadastrada com este nome');
		}

		const slug = await generateUniqueSlug(prisma.tag, dto.name);

		return await this.repository.create(dto, slug);
	}

	async getAll(filters: FindAllTagsDto): Promise<{
		data: Tag[];
		meta: {
			page: number;
			pageSize: number;
			totalItems: number;
			totalPages: number;
			hasNext: boolean;
			hasPrevious: boolean;
		};
	}> {
		const result = await this.repository.findAll(filters);
		const totalPages = Math.ceil(result.total / filters.limit);

		return {
			data: result.items,
			meta: {
				page: filters.page,
				pageSize: filters.limit,
				totalItems: result.total,
				totalPages,
				hasNext: filters.page < totalPages,
				hasPrevious: filters.page > 1,
			},
		};
	}

	async getById(id: string): Promise<Tag> {
		const tag = await this.repository.findById(id);
		if (!tag) {
			throw new NotFoundError('Tag');
		}
		return tag;
	}

	async getBySlug(slug: string): Promise<Tag> {
		const tag = await this.repository.findBySlug(slug);
		if (!tag) {
			throw new NotFoundError('Tag');
		}
		return tag;
	}

	async update(id: string, dto: UpdateTagDto): Promise<Tag> {
		await this.getById(id);

		if (dto.name !== undefined) {
			const existing = await this.repository.findByName(dto.name);
			if (existing && existing.id !== id) {
				throw new ConflictError('JÃ¡ existe outra tag cadastrada com este nome');
			}
		}

		let slug: string | undefined;
		if (dto.name !== undefined) {
			slug = await generateUniqueSlug(prisma.tag, dto.name);
		}

		return await this.repository.update(id, dto, slug);
	}

	async delete(id: string): Promise<void> {
		await this.getById(id);
		await this.repository.delete(id);
	}
}
