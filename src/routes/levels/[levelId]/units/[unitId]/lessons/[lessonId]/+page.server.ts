import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fetchLesson } from '$lib/server/queries/lessonQuery';
import { progressApi, subscriptionApi, profileApi } from '$lib/api';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const { lessonId } = params;
    const levelId = params.levelId;
    const unitId = params.unitId;

    console.log(`Loading lesson: ${lessonId} from Level ${levelId}, Unit ${unitId}`);

    if (!lessonId) {
      throw error(400, { message: 'Lesson ID is required' });
    }

    const lesson = await fetchLesson(lessonId);

    console.log('Returning lesson data:', lesson);
    return {
      lesson,
      levelId,
      unitId
    };
  } catch (err) {
    console.error('Error loading lesson data:', err);
    throw error(500, {
      message: 'Failed to load lesson data',
      error: err instanceof Error ? err.message : String(err)
    });
  }
};
