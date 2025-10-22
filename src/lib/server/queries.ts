import { fetchData } from './sanityClient';
import { createDraftFilter, includeDrafts, ENVIRONMENT } from './environment';
import { heroQuery } from './queries/components/heroQuery';
import { introQuery } from './queries/components/introQuery';
import { sideBySideQuery } from './queries/components/sideBySideQuery';
import { choosePlanQuery } from './queries/components/choosePlanQuery';
import { faqQuery } from './queries/components/faqQuery';
import { imageCloudQuery } from './queries/components/imageCloudQuery';
import { mediaSliderQuery } from './queries/components/mediaSliderQuery';
import { largeCtaQuery } from './queries/components/largeCtaQuery';
import { mainCtaSectionQuery } from './queries/components/mainCtaSectionQuery';
import { mediaBlockQuery } from './queries/components/mediaBlockQuery';

const componentTypes = `
    ${heroQuery},
    ${introQuery},
    ${largeCtaQuery},
    ${mainCtaSectionQuery},
    ${choosePlanQuery},
    ${sideBySideQuery},
    ${mediaSliderQuery},
    ${faqQuery},
    ${imageCloudQuery},
		${mediaBlockQuery},
    _type == "quickFacts" => {
      title,
      facts[]{
        title,
        icon
      }
    },
    _type == "mediaBlock" => {
      media->{
        _id,
        title,
        ...
      }
    },
    _type == "level" => {
      title
    },
    _type == "signup" => {
      title,
      answers[]{
        title,
        image,
        id
      }
    }`;

export async function fetchPage(slug: string) {
  try {
    console.log(`Fetching page with slug "${slug}" in ${ENVIRONMENT} environment`);

    // Get the appropriate draft filter based on environment
    const draftFilter = createDraftFilter();

    // The main page query with appropriate draft filtering
    const query = `*[slug.current == $slug ${draftFilter}]{
		  _id,
		  title,
		  components[]->{
		    _type,
		    _id,
		    "componentType": _type,
		    ...,
		     ${componentTypes}
		  }
		}`;

    const pageData = await fetchData(query, { slug });

    // In dev/staging, we prioritize draft content over published
    if (includeDrafts && Array.isArray(pageData) && pageData.length > 0) {
      // Find a draft document first, fallback to any document
      const draftPage = pageData.find((doc) => doc._id?.startsWith('drafts.'));
      return draftPage ? [draftPage] : pageData;
    }

    return pageData;
  } catch (error) {
    console.error(`Error fetching page "${slug}":`, error);
    return [];
  }
}

export async function fetchSiteSettings(): Promise<any> {
  const query = `*[_type == "siteSettings"][0]{
    ...,
    "ogImage": select(
      defined(ogImage.asset) => {
        "url": ogImage.asset->url,
        "assetId": ogImage.asset->_id
      }
    )
  }`;
  try {
    const siteSettings = await fetchData(query);
    return siteSettings;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    throw new Error('Failed to fetch site settings');
  }
}

/**
 * Fetches global site elements like header and footer
 */
export async function fetchGlobals(): Promise<any> {
  // Create a GROQ query to fetch both header and footer in one request
  const query = `{
    "header": *[_type == "header"][0]{
      _id,
      title,
      "buttons": buttons[]-> {
        ...,
        link {
          ...,
          "internalLink": internalLink-> {
            ...,
            "slug": slug.current
          }
        }
      }
    },
    "footer": *[_type == "footer"][0]{
      _id,
      title,
      tagLine,
      copyright,
      "social": social[]-> {
        _id,
        title,
        url,
        "icon": icon {
          asset->
        }
      },
      links,
      privacyAndTerms
    },
    "activePlans": *[_type == "activePlans"][0]{
      title,
      plans[]->
    },
    "onlyDesktop": *[_type == "onlyDesktop"][0]{
      title,
      description,
      image,
      "image": select(
        defined(image.asset) => {
          "url": image.asset->url,
          "assetId": image.asset->_id,
          "assetUrl": image.asset->url,
          "metadata": image.asset->metadata,
          "alt": image.alt,
          "dimensions": image.asset->metadata.dimensions,
          "lqip": image.asset->metadata.lqip
        },
        null
      )
    }
  }`;

  try {
    const globals = await fetchData(query);
    return globals;
  } catch (error) {
    console.error('Error fetching globals:', error);
    throw new Error('Failed to fetch global site elements');
  }
}
