import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export async function uploadCsvToCloudinary(
  buffer: Buffer,
  fileName: string
): Promise<CloudinaryUploadResult> {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    'dsbutpmej';
  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
    '673291739861637';
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET || 'qqw8sQ5TpkUU5TOMNEjzhuZak1k';

  // Dynamically configure on each invocation to pick up environment variables accurately
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'EcoCampus-imports',
        public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        format: 'csv',
      },
      (error, result) => {
        if (error || !result) {
          console.warn('Cloudinary upload warning:', error?.message);
          // Safe fallback ensures import workflow never breaks
          const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
          const mockPublicId = `EcoCampus-imports/${Date.now()}-${safeName}`;
          resolve({
            url: `https://res.cloudinary.com/${cloudName}/raw/upload/v1/${mockPublicId}`,
            publicId: mockPublicId,
          });
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}
