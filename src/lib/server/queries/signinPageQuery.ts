import { fetchData } from '../sanityClient';
import { createDraftFilter, includeDrafts, ENVIRONMENT } from '../environment';

export async function fetchPage() {
  try {
    console.log(`Fetching signinPage in ${ENVIRONMENT} environment`);

    // Get the appropriate draft filter based on environment
    const draftFilter = createDraftFilter();
    const query = signinPageQuery;
    const pageData = await fetchData(query, {});

    // In dev/staging, we prioritize draft content over published
    if (includeDrafts && Array.isArray(pageData) && pageData.length > 0) {
      // Find a draft document first, fallback to any document
      const draftPage = pageData.find((doc) => doc._id?.startsWith('drafts.'));
      return draftPage ? [draftPage] : pageData;
    }

    return pageData;
  } catch (error) {
    console.error(`Error fetching signinPage":`, error);
    return [];
  }
}

/**
 * Get signin page with their specific fields
 */
export const signinPageQuery = `
  *[_type == "signinPage"] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    afterSignUpTitle,
    afterEmailUpdateTitle,
    error,
    success
  }[0]
`;
