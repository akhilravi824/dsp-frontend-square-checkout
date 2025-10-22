import { fetchData } from '../sanityClient';
import { createDraftFilter, includeDrafts, ENVIRONMENT } from '../environment';

export async function fetchPage() {
  try {
    console.log(`Fetching swapSubscriptionPage in ${ENVIRONMENT} environment`);

    // Get the appropriate draft filter based on environment
    const draftFilter = createDraftFilter();
    const query = swapSubscriptionPageQuery;
    const pageData = await fetchData(query, {});

    // In dev/staging, we prioritize draft content over published
    if (includeDrafts && Array.isArray(pageData) && pageData.length > 0) {
      // Find a draft document first, fallback to any document
      const draftPage = pageData.find((doc) => doc._id?.startsWith('drafts.'));
      return draftPage ? [draftPage] : pageData;
    }

    return pageData;
  } catch (error) {
    console.error(`Error fetching swapSubscriptionPage:`, error);
    return [];
  }
}

/**
 * Get swap subscription page with all its specific fields
 */
export const swapSubscriptionPageQuery = `
  *[_type == "swapSubscriptionPage"] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    ctaSubtitle,
    swapConfirmationTitle,
    swapConfirmationCopy,
    "plans": plans[]->{
      _id,
      variationId,
      title,
      label,
      copy,
      price,
      priceDetails,
      billingDetails,
      details,
      perks,
    }
  }[0]
`;
