import { fetchData } from '../sanityClient';
import { createDraftFilter, includeDrafts, ENVIRONMENT } from '../environment';
import { callToActionQuery } from './molecules/callToActionQuery';

export async function fetchPage() {
  try {
    console.log(`Fetching dashboardPage in ${ENVIRONMENT} environment`);

    // Get the appropriate draft filter based on environment
    const draftFilter = createDraftFilter();
    const query = dashboardPageQuery;
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
export const dashboardPageQuery = `
  *[_type == "dashboardPage"] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    "slug": slug.current,
    welcomeMessage,
    welcomeBackMessage,
    callToActionContinueLevel-> {
      ${callToActionQuery}
    },
    callToActionPaidPlanNotStarted-> {
      ${callToActionQuery}
    },
    callToActionInactive-> {
      ${callToActionQuery}
    },
    callToActionFreeTrialNotStarted-> {
      ${callToActionQuery}
    },
    callToActionFreeTrialTwoLessonsLeft-> {
      ${callToActionQuery}
    },
    callToActionFreeTrialAllLessonsCompleted-> {
      ${callToActionQuery}
    }
  }[0]
`;
