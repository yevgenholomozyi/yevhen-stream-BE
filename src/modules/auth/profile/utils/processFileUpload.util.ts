import * as sharp from 'sharp'
import { StorageService } from '../../../libs/storage/storage.service'
import * as Upload from 'graphql-upload/Upload.js'


export async function processFileUpload(
    fileName: string,
    storageService: StorageService,
    file: Upload,
    buffer: Buffer
) {
    if (file?.filename?.endsWith('.gif')) {
        const processedBuffer = await sharp(buffer, { animated: true })
            .resize(512, 512)
            .webp()
            .toBuffer()

        await storageService.upload(
            processedBuffer,
            fileName,
            'image/webp'
        )
    } else {
        const processedBuffer = await sharp(buffer)
            .resize(512, 512)
            .webp()
            .toBuffer()

        await storageService.upload(
            processedBuffer,
            fileName,
            'image/webp'
        )
    }  
}
