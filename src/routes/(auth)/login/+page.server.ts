import type { PageServerLoad, Actions } from './$types';
import { error } from '@sveltejs/kit';
import { fetchPage } from '$lib/server/queries/signinPageQuery';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const page = await fetchPage();
    return { page };
  } catch (err) {
    console.error('Error loading signinPage data:', err);
    throw error(500, {
      message: 'Failed to load signinPage data',
      error: err instanceof Error ? err.message : String(err)
    });
  }
};

export const actions = {
  setLearningType: async ({ cookies, request }) => {
    const data = await request.formData();
    const learningType = data.get('learningType')?.toString();

    if (learningType) {
      // Set cookie server-side with proper options
      cookies.set('user_learning_type', learningType, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
        sameSite: 'lax'
      });

      return { success: true, learningType };
    }

    return { success: false };
  }
} satisfies Actions;
