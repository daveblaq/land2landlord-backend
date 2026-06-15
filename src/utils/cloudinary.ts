import { v2 as cloudinary } from 'cloudinary';
import logger from './logger';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER = process.env.CLOUDINARY_FOLDER || 'media';

/** Max size per gallery image (matches provider onboarding UI: 5MB). */
export const MAX_GALLERY_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * Upload to Cloudinary into the "media" collection/folder
 */
export const uploadToMedia = async (file: string, publicId?: string) => {
  if (process.env.USE_MOCK === 'true') {
    logger.info(`[MOCK MODE] Mock uploading document to Cloudinary for ${publicId}`);
    return `https://res.cloudinary.com/demo/image/upload/kyc_mock_${publicId}.jpg`;
  }

    try {
        const response = await cloudinary.uploader.upload(file, {
            folder: FOLDER,
            public_id: publicId,
            resource_type: 'auto',
        });
        return response.secure_url;
    } catch (error: any) {
        logger.error('Cloudinary Upload Error:', error.message);
        throw new Error('Failed to upload document to security cloud');
    }
};

/**
 * Upload a raw image buffer (e.g. multipart file) to the media folder.
 */
export const uploadImageBufferToMedia = async (
    buffer: Buffer,
    mimetype: string,
    publicId?: string,
): Promise<string> => {
    if (buffer.length > MAX_GALLERY_IMAGE_BYTES) {
        throw new Error('Image exceeds maximum size of 5MB');
    }
    if (!/^image\//i.test(mimetype)) {
        throw new Error('File must be an image');
    }
    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimetype};base64,${base64}`;
    return uploadToMedia(dataUri, publicId);
};

/**
 * Upload a raw file buffer of any type (e.g. image, PDF, document) to the media folder.
 */
export const uploadBufferToMedia = async (
    buffer: Buffer,
    mimetype: string,
    publicId?: string,
): Promise<string> => {
    const MAX_CHAT_FILE_BYTES = 10 * 1024 * 1024; // 10MB limit
    if (buffer.length > MAX_CHAT_FILE_BYTES) {
        throw new Error('File exceeds maximum size of 10MB');
    }
    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimetype};base64,${base64}`;
    return uploadToMedia(dataUri, publicId);
};

/**
 * Delete from Cloudinary
 */
export const deleteFromMedia = async (publicId: string) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
        logger.error('Cloudinary Deletion Error:', error.message);
    }
};
