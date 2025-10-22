import { createClient } from '@sanity/client';
import { env } from '$env/dynamic/private';
import { includeDrafts } from './environment';

// Create a client configured based on environment
export const sanityClient = createClient({
  projectId: env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2023-08-01',
  useCdn: false, // Set to true in production for better performance

  // Only include token in dev/staging and if token is provided
  token: includeDrafts && env.SANITY_API_TOKEN ? env.SANITY_API_TOKEN : undefined,

  // Set to 'published' in production, use 'previewDrafts' in dev/staging if token is available
  perspective: includeDrafts && env.SANITY_API_TOKEN ? 'previewDrafts' : 'published'
});

// Enhanced query function with better error handling
export async function fetchData(query, params = {}) {
  try {
    //console.log(`Executing Sanity query with params:`, params);
    const result = await sanityClient.fetch(query, params);
    return result;
  } catch (error) {
    console.error('Error fetching data from Sanity:', error);
    //console.error('Query that caused the error:', query);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
}
