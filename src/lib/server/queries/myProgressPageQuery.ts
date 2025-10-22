import { fetchData } from '../sanityClient';
import { createDraftFilter, includeDrafts, ENVIRONMENT } from '../environment';

export async function fetchPage() {
  try {
    console.log(`Fetching dashboardPage in ${ENVIRONMENT} environment`);

    // Get the appropriate draft filter based on environment
    const draftFilter = createDraftFilter();
    const query = myProgressPageQuery;
    const pageData = await fetchData(query, {});

    // In dev/staging, we prioritize draft content over published
    if (includeDrafts && Array.isArray(pageData) && pageData.length > 0) {
      // Find a draft document first, fallback to any document
      const draftPage = pageData.find((doc) => doc._id?.startsWith('drafts.'));
      return draftPage ? [draftPage] : pageData;
    }
    return pageData;
  } catch (error) {
    console.error(`Error fetching dashboardPage:`, error);
    return [];
  }
}

/**
 * Get dashboard page with all its specific fields
 */
export const myProgressPageQuery = `
  *[_type == "progressPage"] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    description,
    	components[]->{
		    _type,
		    _id,
		    "componentType": _type,
		    ...,
		    _type == "section" => {
          title,
        },
		  }
  }[0]
`;
