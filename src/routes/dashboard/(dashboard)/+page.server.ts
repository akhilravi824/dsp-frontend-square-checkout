import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fetchPage } from '$lib/server/queries/dashboardPageQuery';

export const load: PageLoad = async ({ params }) => {
  try {
    const page = await fetchPage();
    return { page };
  } catch (err) {
    console.error('Error loading dashboardPage data:', err);
    throw error(500, {
      message: 'Failed to load dashboardPage data'
    });
  }
};
