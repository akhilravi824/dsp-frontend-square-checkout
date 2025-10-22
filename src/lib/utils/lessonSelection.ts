/**
 * Finds the most appropriate lesson to display based on priority rules:
 * 1. First lesson marked as current
 * 2. First unlocked incomplete lesson
 * 3. First lesson in the first unit with lessons
 *
 * @param level The level data containing units and lessons
 * @returns Object containing the selected lesson and its unit index, or null values if none found
 */
export function findCurrentLesson(level: any) {
  const result = {
    currentLesson: null as any,
    currentLessonUnitIndex: -1
  };

  const units = level?.units;
  if (!Array.isArray(units) || !units.length) {
    return result;
  }

  let fallbackLesson = null;
  let fallbackIndex = -1;

  // Look for a current lesson
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (!u?.lessons?.length) continue;

    // Priority 1: lesson with current:true
    const foundCurrent = u.lessons.find((l) => l?.current === true);
    if (foundCurrent) {
      result.currentLesson = foundCurrent;
      result.currentLessonUnitIndex = i;
      return result; // Found best match
    }

    // Capture first suitable fallback (unlocked + incomplete)
    if (fallbackLesson == null) {
      const open = u.lessons.find((l) => !l?.locked && !l?.complete);
      if (open) {
        fallbackLesson = open;
        fallbackIndex = i;
      }
    }
  }

  // Use fallback if no explicit current lesson
  if (fallbackLesson) {
    result.currentLesson = fallbackLesson;
    result.currentLessonUnitIndex = fallbackIndex;
    return result;
  }

  // Final fallback: very first lesson with an id
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (u?.lessons?.length) {
      result.currentLesson = u.lessons[0];
      result.currentLessonUnitIndex = i;
      return result;
    }
  }

  return result; // Return default values if nothing found
}
