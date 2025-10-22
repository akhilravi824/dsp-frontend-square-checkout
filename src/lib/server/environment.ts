import { env } from '$env/dynamic/private';

export type Environment = 'staging' | 'production';

// Set the environment based on env variable or default to production
export const ENVIRONMENT: Environment = ['staging', 'production'].includes(env.SANITY_ENV as string)
  ? (env.SANITY_ENV as Environment)
  : 'production';

export const isStaging = ENVIRONMENT === 'staging';
export const isProduction = ENVIRONMENT === 'production';

// Helper to determine if we should include drafts
export const includeDrafts = isStaging;

// Create GROQ filter to exclude drafts in production
export function createDraftFilter() {
  return isProduction ? '&& !(_id in path("drafts.**"))' : '';
}

// Simplified draft resolution that makes sure to keep published content
export function resolveDrafts(results) {
  if (!Array.isArray(results) || results.length === 0) return results;

  // For production, just return the results
  if (isProduction || !includeDrafts) return results;

  try {
    console.log(
      'Resolving drafts from results:',
      results.map((r) => r._id || 'unknown')
    );

    // Use a map to store documents by their base ID
    const docsMap = new Map();

    // Process all documents
    results.forEach((doc) => {
      if (!doc || !doc._id) {
        console.warn('Document without _id found:', doc);
        return;
      }

      const isDraft = doc._id.startsWith('drafts.');
      // Remove 'drafts.' prefix to get the base ID
      const baseId = isDraft ? doc._id.substring(7) : doc._id;

      // If we don't have this doc yet, or this is a draft (which takes precedence)
      if (!docsMap.has(baseId) || isDraft) {
        docsMap.set(baseId, doc);
      }
    });

    // Convert map back to array
    const resolvedDocs = Array.from(docsMap.values());

    console.log(
      'After resolving drafts:',
      resolvedDocs.map((r) => r._id || 'unknown')
    );
    return resolvedDocs;
  } catch (error) {
    console.error('Error resolving drafts:', error);
    return results;
  }
}

// Log environment on startup
console.log(`Running in ${ENVIRONMENT} environment (${includeDrafts ? 'including' : 'excluding'} drafts)`);
