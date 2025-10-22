import { env } from '$env/dynamic/public';

// Base URL for your Sanity project
const projectId = env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id';
const dataset = env.PUBLIC_SANITY_DATASET || 'production';

// Sanity image URL builder options
type ImageBuilderOptions = {
  width?: number;
  height?: number;
  format?: 'jpg' | 'png' | 'webp';
  quality?: number;
  auto?: 'format';
};

/**
 * Builds a URL for Sanity images
 * @param ref - Sanity image asset reference
 * @param options - Image options for transformations
 * @returns The complete image URL
 */
export function getImageUrl(ref: string, options: ImageBuilderOptions = {}): string {
  if (!ref) {
    return '';
  }

  // Extract image ID from the reference
  const imageId = ref.replace('image-', '').replace('-jpg', '').replace('-png', '');

  // Base URL for the Sanity CDN
  let url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${imageId}`;

  // Add image format
  if (ref.includes('-jpg')) {
    url += '.jpg';
  } else if (ref.includes('-png')) {
    url += '.png';
  } else if (ref.includes('-webp')) {
    url += '.webp';
  }

  // Add transformation parameters
  const params: string[] = [];

  if (options.width) params.push(`w=${options.width}`);
  if (options.height) params.push(`h=${options.height}`);
  if (options.format) params.push(`fm=${options.format}`);
  if (options.quality) params.push(`q=${options.quality}`);
  if (options.auto) params.push(`auto=${options.auto}`);

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return url;
}

/**
 * Builds a URL for Sanity video assets
 * @param ref - Sanity video asset reference
 * @returns The complete video URL
 */
export function getVideoUrl(ref: string): string {
  if (!ref) {
    return '';
  }

  // Extract video ID and format from the reference
  // Example format: file-1234abcd-mp4
  const match = ref.match(/file-([a-zA-Z0-9]+)-(\w+)/);
  if (!match) return '';

  const [, videoId, format] = match;
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${videoId}.${format}`;
}
