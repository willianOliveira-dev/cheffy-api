import { createHash } from 'node:crypto';
import { env } from '@/config/env.js';
import { InternalServerError } from '@/shared/errors/app.error.js';
import type { SignUploadDto } from '../schemas/dtos/sign-upload.dto.js';

type CloudinarySignableParams = Record<string, string | number | boolean>;
type StorageTarget = SignUploadDto['target'];

const targetFolders = {
	recipes: 'cheffy/recipes',
	ingredients: 'cheffy/ingredients',
	categories: 'cheffy/categories',
} satisfies Record<StorageTarget, string>;

export class StorageService {
	generateUploadSignature(dto: SignUploadDto) {
		const timestamp = Math.round(Date.now() / 1000);
		const folder = targetFolders[dto.target];
		const publicId = dto.entityId;
		const paramsToSign: CloudinarySignableParams = {
			timestamp,
			folder,
			public_id: publicId,
			overwrite: true,
			invalidate: true,
		};

		const signature = this.signCloudinaryParams(paramsToSign);

		return {
			signature,
			timestamp,
			folder,
			publicId,
			cloudName: env.CLOUDINARY_CLOUD_NAME,
			apiKey: env.CLOUDINARY_API_KEY,
			uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
		};
	}

	async deleteImageAsset(publicId: string): Promise<void> {
		if (!publicId.startsWith('cheffy/')) return;

		const timestamp = Math.round(Date.now() / 1000);
		const paramsToSign = {
			public_id: publicId,
			timestamp,
			invalidate: true,
		};
		const signature = this.signCloudinaryParams(paramsToSign);
		const body = new URLSearchParams({
			public_id: publicId,
			timestamp: String(timestamp),
			invalidate: 'true',
			api_key: env.CLOUDINARY_API_KEY,
			signature,
		});

		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
			{
				method: 'POST',
				body,
			},
		);

		if (!response.ok) {
			throw new InternalServerError('Falha ao remover imagem do Cloudinary');
		}
	}

	private signCloudinaryParams(params: CloudinarySignableParams) {
		const stringToSign = Object.entries(params)
			.sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
			.map(([key, value]) => `${key}=${value}`)
			.join('&');

		return createHash('sha1').update(`${stringToSign}${env.CLOUDINARY_API_SECRET}`).digest('hex');
	}
}
