import { fetchData } from '../sanityClient';
import { createDraftFilter, includeDrafts, ENVIRONMENT } from '../environment';

export async function fetchPage() {
  try {
    console.log(`Fetching settingsPage in ${ENVIRONMENT} environment`);

    // Get the appropriate draft filter based on environment
    const draftFilter = createDraftFilter();
    const query = settingsPageQuery;
    const pageData = await fetchData(query, {});

    // In dev/staging, we prioritize draft content over published
    if (includeDrafts && Array.isArray(pageData) && pageData.length > 0) {
      // Find a draft document first, fallback to any document
      const draftPage = pageData.find((doc) => doc._id?.startsWith('drafts.'));
      return draftPage ? [draftPage] : pageData;
    }

    return pageData;
  } catch (error) {
    console.error(`Error fetching settingsPage:`, error);
    return [];
  }
}

/**
 * Get settings page with all its specific fields
 */
export const settingsPageQuery = `
  *[_type == "settingsPage"] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    "slug": slug.current,
    description,
    components[]->{
      _type,
      _id,
      "componentType": _type,
      ...,
      _type == "accountSection" => {
        title,
        description,
      },
      _type == "notificationsSection" => {
        title,
        description,
      },
      _type == "profileSection" => {
        title,
        description,
        consentText,
        learnMoreAboutTermsText,
        learnMoreAboutTermsUrl,
      },
      _type == "securitySection" => {
        title,
        description,
        perksEyebrow,
        perks,
      },
      _type == "subscriptionSection" => {
        title,
        description,
        plans[]->{
          _id,
          title,
          variationId,
          label,
          copy,
          price,
          priceDetails,
          billingDetails,
          details,
          perks,
        },
        pendingPlanChangeCopy,
        cancellationModalTitle,
        cancellationModalCopy,
        pendingPlanCancellationCopy,
      },
    }
  }[0]
`;
