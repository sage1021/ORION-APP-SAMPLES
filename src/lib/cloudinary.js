const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime'
];

/**
 * Uploads an image or video to Cloudinary using an unsigned upload preset.
 * Enforces strict file type & size limits before executing fetch.
 * 
 * @param {File} file - File object to upload
 * @returns {Promise<string>} Secure URL of uploaded asset
 */
export async function uploadToCloudinary(file) {
  if (!file) throw new Error("No file selected for upload.");

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Invalid file format. Allowed formats: JPEG, PNG, WEBP, GIF, MP4, WEBM.");
  }

  const isVideo = file.type.startsWith('video/');
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    throw new Error(`File size exceeds limit (${isVideo ? '50MB for video' : '10MB for image'}).`);
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'orion_preset';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Cloudinary upload failed.");
  }

  const data = await response.json();
  return data.secure_url;
}
