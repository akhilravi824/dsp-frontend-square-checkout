import type { ServerLoadEvent } from '@sveltejs/kit';
import { fetchPage } from '$lib/server/queries';
import { ENVIRONMENT, isStaging } from '$lib/server/environment';

/**
 * Generic page loader function that can be used across all pages
 */
export async function loadPage(event: ServerLoadEvent) {
  try {
    // Extract the path and remove leading slash
    const path = event.url.pathname;

    // Use 'home' for root path, otherwise use the path without leading slash
    const slug = path === '/' || path === '/sanity' ? 'home' : path.substring(1);

    console.log(`Loading page with slug: "${slug}"`);

    //const pageData = await fetchPage(slug, contentType);
    const pageData = await fetchPage(slug);

    // If pageData is an array (which it likely is from the query),
    // we typically want the first item
    const page =
      Array.isArray(pageData) && pageData.length > 0
        ? pageData[0]
        : {
            title: `Page not found: ${slug}`,
            _id: 'not-found',
            components: [] // Make sure this matches your actual field name
          };

    // Only show environment indicator in dev and staging
    const showEnvironment = isStaging;
    const isDraft = page._id && page._id.startsWith('drafts.');

    return {
      page,
      meta: {
        environment: ENVIRONMENT,
        showEnvironment,
        isDraft,
        slug
      }
    };
  } catch (error) {
    console.error('Error loading page:', error);
    return {
      page: {
        title: 'Error loading page',
        _id: 'error',
        components: [] // Make sure this matches your actual field name
      },
      meta: {
        environment: ENVIRONMENT,
        error: true
      }
    };
  }
}

/**
 * Optional: You can extend this with specific page loaders that add additional data
 */
export async function loadLessonsPage(event: ServerLoadEvent) {
  // Get the standard page data
  const pageData = await loadPage(event);

  // Add lessons-specific data
  // const lessons = await fetchLessons();

  return {
    ...pageData
    // lessons
  };
}

/**
 * Optional: You can create page loaders for specific sections
 */
export async function loadSectionPage(event: ServerLoadEvent, section: string) {
  // Get the path but prepend the section
  const originalPath = event.url.pathname;
  const modifiedUrl = new URL(event.url);
  modifiedUrl.pathname = `/${section}${originalPath}`;

  // Create a modified event object
  const modifiedEvent = {
    ...event,
    url: modifiedUrl
  };

  return loadPage(modifiedEvent);
}
