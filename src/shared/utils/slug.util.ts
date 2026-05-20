export interface PrismaDelegate {
	findFirst(args: {
		where: Record<string, string>;
		select?: Record<string, boolean>;
	}): Promise<unknown | null>;
}

export async function generateUniqueSlug(
	prismaDelegate: PrismaDelegate,
	text: string,
): Promise<string> {
	const baseSlug = text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

	let slug = baseSlug;

	let counter = 1;

	while (true) {
		const exists = await prismaDelegate.findFirst({
			where: { slug: slug },
			select: { slug: true },
		});

		if (!exists) {
			return slug;
		}

		slug = `${baseSlug}-${counter}`;
		counter++;
	}
}
