import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db/prisma.js';
import type { CreateTagDto } from '../schemas/dtos/create-tag.dto.js';
import type { FindAllTagsDto } from '../schemas/dtos/find-all-tags.dto.js';
import type { UpdateTagDto } from '../schemas/dtos/update-tag.dto.js';

export class TagsRepository {
	constructor(private readonly db: PrismaClient = prisma) {}

	async create(data: CreateTagDto, slug: string) {
		return await this.db.tag.create({
			data: {
				name: data.name,
				slug,
			},
		});
	}

	async findAll(filters: FindAllTagsDto) {
		const where: Prisma.TagWhereInput = {};

		if (filters.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: 'insensitive' } },
				{ slug: { contains: filters.search, mode: 'insensitive' } },
			];
		}

		const skip = (filters.page - 1) * filters.limit;

		const [items, total] = await Promise.all([
			this.db.tag.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy: { name: 'asc' },
			}),
			this.db.tag.count({ where }),
		]);

		return { items, total };
	}

	async findById(id: string) {
		return await this.db.tag.findUnique({ where: { id } });
	}

	async findBySlug(slug: string) {
		return await this.db.tag.findUnique({ where: { slug } });
	}

	async findByName(name: string) {
		return await this.db.tag.findUnique({ where: { name } });
	}

	async update(id: string, data: UpdateTagDto, slug?: string) {
		const updateData: Prisma.TagUpdateInput = {};

		if (data.name !== undefined) updateData.name = data.name;
		if (slug !== undefined) updateData.slug = slug;

		return await this.db.tag.update({
			where: { id },
			data: updateData,
		});
	}

	async delete(id: string) {
		await this.db.tag.delete({ where: { id } });
	}
}
