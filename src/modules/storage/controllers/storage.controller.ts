import type { SignUploadDto } from '../schemas/dtos/sign-upload.dto.js';
import { StorageService } from '../services/storage.service.js';

export class StorageController {
	constructor(private readonly service: StorageService) {}

	signUpload(data: SignUploadDto): ReturnType<StorageService['generateUploadSignature']> {
		return this.service.generateUploadSignature(data);
	}
}

export const storageController = new StorageController(new StorageService());
