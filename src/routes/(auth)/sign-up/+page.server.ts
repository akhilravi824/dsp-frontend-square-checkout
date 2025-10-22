import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fetchPage } from '$lib/server/queries/signupPageQuery';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const page = await fetchPage();
    return { page };
  } catch (err) {
    console.error('Error loading signupPage data:', err);
    throw error(500, {
      message: 'Failed to load signupPage data',
      error: err instanceof Error ? err.message : String(err)
    });
  }
};
