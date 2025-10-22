import type { PageServerLoad } from './$types';
import { loadPage } from '$lib/server/pageLoader';

export const load: PageServerLoad = async (event) => {
  return loadPage(event);
};
