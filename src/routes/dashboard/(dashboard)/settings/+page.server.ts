import { fetchPage } from '$lib/server/queries/settingsPageQuery';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const page = await fetchPage();
    return { page };
  } catch (err) {
    console.error('Error loading settingsPage data:', err);
    throw error(500, 'Failed to load settingsPage data');
  }
};
