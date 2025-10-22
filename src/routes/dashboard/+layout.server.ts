import type { LayoutServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { fetchLevels } from '$lib/server/queries/levelQuery';

export const load: LayoutServerLoad = async ({ fetch, cookies }) => {
  try {
    const learningType = cookies.get('user_learning_type') || 'student';
    const levels = await fetchLevels(learningType);

    return {
      levels
    };
  } catch (err) {
    console.error('Error loading level data:', err);

    // Don't expose redirect errors
    if (err.status === 302) {
      throw err;
    }

    throw error(500, {
      message: 'Failed to load level data',
      error: err instanceof Error ? err.message : String(err)
    });
  }
};
