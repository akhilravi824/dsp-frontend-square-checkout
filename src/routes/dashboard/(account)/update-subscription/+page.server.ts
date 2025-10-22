import { fetchPage } from '$lib/server/queries/swapSubscriptionPageQuery';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const page = await fetchPage();
    return { page };
  } catch (err) {
    console.error('Error loading swapSubscriptionPage data:', err);
    throw error(500, 'Failed to load swapSubscriptionPage data');
  }
};
