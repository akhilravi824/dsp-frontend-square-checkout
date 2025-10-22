import type { LayoutServerLoad } from './$types';
import { fetchGlobals, fetchSiteSettings } from '$lib/server/queries';

export const load: LayoutServerLoad = async () => {
  try {
    const globals = await fetchGlobals();
    const siteSettings = await fetchSiteSettings();
    return {
      globals,
      siteSettings
    };
  } catch (error) {
    console.error('Error loading global layout data:', error);
    return {
      globals: {
        header: { title: 'Dawn Sign Press', buttons: [] },
        footer: { title: 'Dawn Sign Press', links: [], social: [] }
      }
    };
  }
};
