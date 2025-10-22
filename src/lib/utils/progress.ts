import { stepUnits } from '$lib/components/sign-up/steps';

export interface LessonProgress {
  id: string;
  attempts: number;
  complete: boolean;
}

export interface UnitProgress {
  lessons: Record<string, LessonProgress>;
}

export interface LevelProgress {
  units: Record<string, UnitProgress>;
  locked: boolean;
}

export interface UserProgress {
  totalAttempts: number;
  totalTimeSpent: number; // in seconds
  activeDays: string[]; // ISO string timestamps
  freeTries: number; // number of free tries available for trial users
  levels: Record<string, LevelProgress>;
}

interface LessonUpdate {
  lessonId: string;
  complete: boolean;
  attempts?: number;
  timeSpent?: number;
}

/**
 * Gets the progress stats for a specific unit
 * @param data - The merged level data
 * @param unitId - The ID of the unit to calculate progress for
 * @returns Object containing total lessons and completed lessons count
 */
export function getUnitProgress(data, unitId) {
  const unit = data.units.find((unit) => unit.unitId.toString() === unitId.toString());

  if (!unit) {
    console.warn(`Unit with ID ${unitId} not found`);
    return { total: 0, completed: 0, percentage: 0 };
  }

  const totalLessons = unit.lessons.length;
  const completedLessons = unit.lessons.filter((lesson) => lesson.complete).length;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    total: totalLessons,
    completed: completedLessons,
    percentage
  };
}

/**
 * Gets the progress stats for the currently highlighted unit
 * @param data - The merged level data
 * @param unitId - The ID of the unit to calculate progress for
 * @returns Object containing total lessons and completed lessons count
 */
export function getCurrentUnitProgress(data, unitId) {
  // Get the current unit ID from the highlighted unit index
  const currentUnit = data.units[unitId];

  if (!currentUnit) {
    return { total: 0, completed: 0, percentage: 0 };
  }

  return getUnitProgress(data, currentUnit.unitId);
}

/**
 * Gets the accuracy stats for a specific unit
 * @param data - The merged level data
 * @param unitId - The ID of the unit to calculate accuracy for
 * @returns Object containing accuracy percentage and number of completed lessons
 */
export function getUnitAccuracy(data, unitId) {
  const unit = data.units.find((unit) => unit.unitId.toString() === unitId.toString());

  if (!unit) {
    return { accuracy: 0, completedLessons: 0 };
  }

  // Filter for only completed lessons
  const completedLessons = unit.lessons.filter((lesson) => lesson.complete);

  if (completedLessons.length === 0) {
    return { accuracy: 0, completedLessons: 0 };
  }

  // Calculate accuracy for each completed lesson
  let totalAccuracy = 0;

  completedLessons.forEach((lesson) => {
    // 1 attempt = 100%, 2 attempts = 50%, etc.
    const lessonAccuracy = lesson.attempts > 0 ? 100 / lesson.attempts : 0;
    totalAccuracy += lessonAccuracy;
  });

  // Calculate average accuracy across all completed lessons
  const averageAccuracy = totalAccuracy / completedLessons.length;

  return {
    accuracy: Math.round(averageAccuracy),
    completedLessons: completedLessons.length
  };
}

/**
 * Gets the accuracy stats for the currently highlighted unit
 * @param data - The merged level data
 * @param unitId - The ID of the unit to calculate progress for
 * @returns Object containing accuracy percentage and number of completed lessons
 */
export function getCurrentUnitAccuracy(data, unitId: string) {
  const currentUnit = data.units[unitId];

  if (!currentUnit) {
    return { accuracy: 0, completedLessons: 0 };
  }

  return getUnitAccuracy(data, currentUnit.unitId);
}

export function mergeAllLevelsData(cmsData, apiData, units: string = '', lockRest: boolean = false) {
  let mergedData: any;
  mergedData = JSON.parse(JSON.stringify(cmsData.levels));
  mergedData.forEach((level, levelIndex) => {
    mergedData[levelIndex] = mergeLevel(level, apiData.levels[level.levelId.toString()]);
  });

  mergedData = !lockRest ? lockingFilter(mergedData, units) : lockRestFilter(mergedData);
  return mergedData;
}

export function mergeLevelData(cmsData, apiData, levelId = '', unitId = '') {
  return mergeLevel(cmsData.level, apiData.levels[levelId.toString()]);
}

// When no subscription plan and free tries = 0, lock all other lessons
function lockRestFilter(data) {
  let lockedData = JSON.parse(JSON.stringify(data));
  let foundCompleted = false;
  lockedData.forEach((level, levelIndex) => {
    level.units?.forEach((unit, unitIndex) => {
      foundCompleted = false;
      unit.lessons?.forEach((lesson, lessonIndex) => {
        if (lesson.complete) {
          foundCompleted = true;
          lesson.locked = false; // Unlocked if complete
        } else {
          lesson.locked = true;
        }
      });

      if (foundCompleted) {
        unit.locked = false;
        level.locked = false;
      } else {
        unit.locked = true;
        level.locked = true;
      }
    });
  });
  return lockedData;
}

/**
 * Filters the data to apply locking based on the current lesson
 * @param data - The level data to apply locking to
 * @returns Locked data with appropriate locked statuses
 */
function lockingFilter(data, units: string) {
  // Create a deep copy once
  let lockedData = JSON.parse(JSON.stringify(data));
  let currentPosition = { levelIndex: 0, unitIndex: 0, lessonIndex: 0 };
  let foundCurrentLesson = false;

  // OPTIMIZATION: Find last completed lesson and current lesson position in a single pass
  let lastCompleted = null;

  lockedData.forEach((level, levelIndex) => {
    level.units?.forEach((unit, unitIndex) => {
      unit.lessons?.forEach((lesson, lessonIndex) => {
        // Clear existing current flags
        if (lesson.current) {
          delete lesson.current;
        }

        // Track the last completed lesson
        if (lesson.complete) {
          lastCompleted = { level, levelIndex, unit, unitIndex, lessonIndex };
        }
      });
    });
  });

  // Mark the next lesson as current and record its position
  if (lastCompleted) {
    const { level, levelIndex, unit, unitIndex, lessonIndex } = lastCompleted;

    // Find next lesson following the progression
    const next =
      level.units[unitIndex].lessons[lessonIndex + 1] ||
      level.units[unitIndex + 1]?.lessons?.[0] ||
      lockedData[levelIndex + 1]?.units?.[0]?.lessons?.[0];

    if (next) {
      // Mark as current
      next.current = true;

      // OPTIMIZATION: Find the position of this lesson without another loop
      // We know it's either in the same unit, next unit, or next level
      if (level.units[unitIndex].lessons[lessonIndex + 1]) {
        currentPosition = {
          levelIndex,
          unitIndex,
          lessonIndex: lessonIndex + 1
        };
      } else if (level.units[unitIndex + 1]?.lessons?.[0]) {
        currentPosition = {
          levelIndex,
          unitIndex: unitIndex + 1,
          lessonIndex: 0
        };
      } else if (lockedData[levelIndex + 1]?.units?.[0]?.lessons?.[0]) {
        currentPosition = {
          levelIndex: levelIndex + 1,
          unitIndex: 0,
          lessonIndex: 0
        };
      }

      foundCurrentLesson = true;
    }
  }

  // Set the first lesson as current
  if (!foundCurrentLesson) {
    lockedData[0].units[0].lessons[0].current = true;
  }

  // Apply locking based on current position more concisely
  lockedData.forEach((level, levelIndex) => {
    // Set level locked status
    level.locked = levelIndex > currentPosition.levelIndex;

    level.units?.forEach((unit, unitIndex) => {
      // Set unit locked status
      unit.locked =
        levelIndex > currentPosition.levelIndex ||
        (levelIndex === currentPosition.levelIndex && unitIndex > currentPosition.unitIndex);

      unit.lessons?.forEach((lesson, lessonIndex) => {
        // Set lesson locked status
        lesson.locked =
          levelIndex > currentPosition.levelIndex ||
          (levelIndex === currentPosition.levelIndex && unitIndex > currentPosition.unitIndex) ||
          (levelIndex === currentPosition.levelIndex &&
            unitIndex === currentPosition.unitIndex &&
            lessonIndex > currentPosition.lessonIndex);

        // overwite locked status if lesson is complete
        if (lesson.current || lesson.complete) lesson.locked = false;
      });
    });
  });

  // Second pass: Ensure that if any lesson is unlocked, its unit and level are also unlocked
  lockedData.forEach((level) => {
    let hasUnlockedLesson = false;

    level.units?.forEach((unit) => {
      // Check if any lessons in this unit are unlocked
      const unitHasUnlockedLesson = unit.lessons?.some((lesson) => !lesson.locked);

      // If unit has any unlocked lessons, ensure unit is also unlocked
      if (unitHasUnlockedLesson) {
        unit.locked = false;
        hasUnlockedLesson = true;
      }
    });

    // If level has any unlocked units, ensure level is also unlocked
    if (hasUnlockedLesson) {
      level.locked = false;
    }
  });

  // If units is answered with signup: unlock lessons based in stepUnits
  if (units) {
    const answer = stepUnits.answers.find((answer) => answer.value === units);
    lockedData = unlockLessons(lockedData, answer?.unlockLevels || 0);
  }

  return lockedData;
}

// Batch unlock based on units
function unlockLessons(data: any, count: number) {
  const result = JSON.parse(JSON.stringify(data));
  let remaining = count;

  result.forEach((level) => {
    level.locked = true;

    level.units?.forEach((unit) => {
      unit.locked = true;

      unit.lessons?.forEach((lesson) => {
        if (lesson.complete || remaining > 0) {
          lesson.locked = false;
          unit.locked = false;
          level.locked = false;
          if (!lesson.complete) remaining--;
          // } else {
          //   lesson.locked = true;
        }
      });
    });
  });

  return result;
}

/**
 * Merges the CMS level data with the API progress data
 * @param cmsLevel - The level data from CMS
 * @param apiLevel - The progress data from API
 * @returns Merged level data with progress information
 */
function mergeLevel(cmsLevel, apiLevel) {
  let mergedLevel: any;
  mergedLevel = JSON.parse(JSON.stringify(cmsLevel));

  cmsLevel.units.forEach((unit, unitIndex: string) => {
    const progressUnit = apiLevel?.units[unit.unitId.toString()];
    if (progressUnit && unit.lessons) {
      unit.lessons.forEach((lesson: any, lessonIndex: string) => {
        if (lesson !== null) {
          const lessonId = lesson.id.replace('-', '');
          if (progressUnit.lessons[lessonId]) {
            const progressData = progressUnit.lessons[lessonId];
            progressData.complete = progressUnit.lessons[lessonId].complete;

            // Copy all progress data properties to the original lesson object
            for (const key in progressData) {
              lesson[key] = progressData[key];
            }

            // Also copy the same progress data to the copyData version of this lesson
            for (const key in progressData) {
              mergedLevel.units[unitIndex].lessons[lessonIndex][key] = progressData[key];
            }
          } else {
            // Initialize default progress data for lessons without existing progress
            const defaultProgress = {
              complete: false,
              attempts: 0,
              timeSpent: 0
            };

            // Add default progress data to original lesson
            for (const key in defaultProgress) {
              lesson[key] = defaultProgress[key];
            }

            // Add default progress data to copyData lesson
            for (const key in defaultProgress) {
              mergedLevel.units[unitIndex].lessons[lessonIndex][key] = defaultProgress[key];
            }
          }
        } else {
          console.warn(
            `Level ${cmsLevel.levelId} '${cmsLevel.title}', Unit ${unit.unitId} '${unit.title}' has undefined lessons`
          );
        }
      });
    }

    const completedLessonsUnit = mergedLevel.units[unitIndex].lessons.filter((lesson) => lesson.complete).length;
    const totalLessonsUnit = mergedLevel.units[unitIndex].lessons.length;
    mergedLevel.units[unitIndex]['stats'] = {
      totalLessons: totalLessonsUnit,
      completedLessons: completedLessonsUnit | 0,
      completedPercentage: totalLessonsUnit > 0 ? Math.round((completedLessonsUnit / totalLessonsUnit) * 100) : 0,
      accuracy: getCurrentUnitAccuracy(mergedLevel, unitIndex).accuracy
    };
  });

  let totalLessons = 0;
  mergedLevel.units.forEach((u) => {
    totalLessons += u.lessons.length;
  });

  let totalLessonsCompleted = 0;
  mergedLevel.units.forEach((u) => {
    totalLessonsCompleted += u.lessons.filter((lesson) => lesson.complete).length;
  });

  mergedLevel['stats'] = {
    totalLessons: totalLessons,
    completedLessons: totalLessonsCompleted,
    completedPercentage: totalLessons > 0 ? Math.round((totalLessonsCompleted / totalLessons) * 100) : 0
  };

  return mergedLevel;
}

/**
 * Calculates overall progress statistics across all levels
 * @param data - The merged level data
 * @returns Object containing overall statistics like total lessons, completed lessons, time spent, etc.
 */
export function calculateOverallStats(data) {
  let totalLessons = 0;
  let totalCompletedLessons = 0;
  let totalTimeSpent = 0;
  let totalUnits = 0;
  let completedUnits = 0;
  let totalAttempts = 0;
  let averageAttempts = 0;
  let mostLessonWithAttempts = [];

  // Variables for accuracy calculation
  let totalAccuracy = 0;
  let completedLessonsWithAttempts = 0;

  // Loop through each level
  data.levels.forEach((level) => {
    // Add to overall lesson counts
    totalLessons += level.stats?.totalLessons || 0;
    totalCompletedLessons += level.stats?.completedLessons || 0;

    // Process each unit
    level.units?.forEach((unit) => {
      // Increment total units counter
      totalUnits++;

      // Check for completed unit
      if (unit.stats?.totalLessons > 0 && unit.stats?.completedLessons === unit.stats?.totalLessons) {
        completedUnits++;
      }

      // Process each lesson
      unit.lessons?.forEach((lesson) => {
        // Sum up time spent in all lessons
        totalTimeSpent += lesson.timeSpent || 0;

        // Calculate accuracy only for completed lessons
        if (lesson.complete) {
          // Avoid division by zero
          if (lesson.attempts > 0) {
            totalAttempts += lesson.attempts || 0;
            averageAttempts = totalAttempts / totalCompletedLessons;
            // 1 attempt = 100%, 2 attempts = 50%, etc.
            const lessonAccuracy = 100 / lesson.attempts;
            totalAccuracy += lessonAccuracy;
            completedLessonsWithAttempts++;
            mostLessonWithAttempts.push({
              levelId: level.levelId,
              unitId: unit.unitId,
              ...lesson
            });
          }
        }
      });
    });
  });

  // Keep only the last 6
  mostLessonWithAttempts.sort((a, b) => b.attempts - a.attempts);
  mostLessonWithAttempts = mostLessonWithAttempts.slice(0, 6);
  // Calculate overall accuracy (average of all completed lessons)
  const overallAccuracy =
    completedLessonsWithAttempts > 0 ? Math.round(totalAccuracy / completedLessonsWithAttempts) : 0;

  return {
    totalLessons,
    totalCompletedLessons,
    totalTimeSpent,
    totalUnits,
    completedUnits,
    completionPercentage: totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0,
    accuracy: overallAccuracy, // Add the overall accuracy to the result
    averageAttempts: averageAttempts,
    totalAttempts: totalAttempts,
    mostLessonWithAttempts: mostLessonWithAttempts
  };
}

export function getLastUnlockedLevel(levels) {
  return levels
    .slice()
    .reverse()
    .find((level) => !level.locked);
}

// Return the first uncompleted level
export function getLastUncompletedLevel(levels) {
  return levels.find((level) => !level.locked && level.stats?.completedLessons < level.stats?.totalLessons);
}

// Return the first uncomplete unit
export function getLastUncompletedUnit(level) {
  if (!level) return null;
  return level.units.find((unit) => !unit.locked && unit.stats?.completedLessons < unit.stats?.totalLessons);
}

// Validated data
export function validateProgressData(progress: UserProgress): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate totalAttempts is a number
  if (typeof progress.totalAttempts !== 'number' || progress.totalAttempts < 0) {
    errors.push('totalAttempts must be a non-negative number');
  }

  // Validate totalTimeSpent is a number
  if (typeof progress.totalTimeSpent !== 'number' || progress.totalTimeSpent < 0) {
    errors.push('totalTimeSpent must be a non-negative number');
  }

  // Validate activeDays is an array of timestamps
  if (!Array.isArray(progress.activeDays)) {
    errors.push('activeDays must be an array');
  } else {
    for (const day of progress.activeDays) {
      if (typeof day !== 'string' || isNaN(Date.parse(day))) {
        errors.push(`Invalid timestamp in activeDays: ${day}`);
      }
    }
  }

  // Validate levels structure
  if (typeof progress.levels !== 'object' || progress.levels === null) {
    errors.push('levels must be an object');
  } else {
    // Check each level
    for (const levelId in progress.levels) {
      const level = progress.levels[levelId];

      if (typeof level.units !== 'object' || level.units === null) {
        errors.push(`Level ${levelId}: units must be an object`);
        continue;
      }

      // Check each unit
      for (const unitId in level.units) {
        const unit = level.units[unitId];

        if (typeof unit.lessons !== 'object' || unit.lessons === null) {
          errors.push(`Level ${levelId}, Unit ${unitId}: lessons must be an object`);
          continue;
        }

        // Check each lesson
        for (const lessonId in unit.lessons) {
          const lesson = unit.lessons[lessonId];

          if (typeof lesson.attempts !== 'number' || lesson.attempts < 0) {
            errors.push(`Level ${levelId}, Unit ${unitId}, Lesson ${lessonId}: attempts must be a non-negative number`);
          }

          if (typeof lesson.complete !== 'boolean') {
            errors.push(`Level ${levelId}, Unit ${unitId}, Lesson ${lessonId}: complete must be a boolean`);
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function updateLessonInProgress(
  data: UserProgress,
  ids: { levelId: string; unitId: number; lessonId: string },
  updateProps: { complete: boolean; timeSpent: number }
) {
  const progressDataCopy = JSON.parse(JSON.stringify(data));
  const lessonIdStripped = ids.lessonId.replace('-', '');

  // Initialize the structure if it doesn't exist
  if (!progressDataCopy.levels[ids.levelId]) {
    progressDataCopy.levels[ids.levelId] = { units: {} };
  }

  if (!progressDataCopy.levels[ids.levelId].units[ids.unitId]) {
    progressDataCopy.levels[ids.levelId].units[ids.unitId] = { lessons: {} };
  }

  // Reference to lessons object for cleaner code
  const lessonsRef = progressDataCopy.levels[ids.levelId].units[ids.unitId].lessons;

  // Check if the lesson exists in the unit
  let previousLessonCompletedState: boolean = false;
  if (lessonsRef[lessonIdStripped]) {
    // Update existing lesson
    previousLessonCompletedState = lessonsRef[lessonIdStripped].complete;

    // Sets the lesson as complete if it was not already
    lessonsRef[lessonIdStripped].complete = previousLessonCompletedState ? true : updateProps.complete;

    lessonsRef[lessonIdStripped].attempts =
      updateProps.complete || lessonsRef[lessonIdStripped].complete
        ? lessonsRef[lessonIdStripped].attempts
        : lessonsRef[lessonIdStripped].attempts + 1;
    lessonsRef[lessonIdStripped].timeSpent = lessonsRef[lessonIdStripped].timeSpent + updateProps.timeSpent;
    lessonsRef[lessonIdStripped].lastAccessed = new Date().toISOString().split('T')[0];
  } else {
    // Create new lesson entry
    lessonsRef[lessonIdStripped] = {
      complete: updateProps.complete,
      attempts: 1,
      timeSpent: updateProps.timeSpent,
      attempt: true
    };
  }

  // Free tries
  if (!previousLessonCompletedState && updateProps.complete) {
    progressDataCopy.freeTries = Math.max(0, progressDataCopy.freeTries - 1);
  }

  progressDataCopy.totalAttempts += 1; // Increment only if not complete
  progressDataCopy.totalTimeSpent += updateProps.timeSpent;

  const validated = validateProgressData(progressDataCopy);
  return progressDataCopy;
}

/**
 * Gets the next lesson, unit, and level based on current position
 * @param data - The merged data from the JSON file or a single level object
 * @param levelId - Current level ID
 * @param unitId - Current unit ID
 * @param lessonId - Current lesson ID
 * @returns Object containing next lesson, unit, and level info where the next lesson is located
 */
export function getNextItems(data: any, levelId: string, unitId: string, lessonId: string) {
  // Convert IDs to numbers where needed
  const numLevelId = parseInt(levelId);
  const numUnitId = parseInt(unitId);
  const maxLevels = 5;

  // Ensure data is properly structured as an array
  const levels = Array.isArray(data) ? data : [data];

  // Find the current level
  const currentLevel = levels.find((level) => level.levelId === numLevelId);
  if (!currentLevel) return { nextLesson: null, nextUnit: null, nextLevel: null };

  // Find the current unit
  const currentUnit = currentLevel.units.find((unit) => unit.unitId === numUnitId);
  if (!currentUnit) return { nextLesson: null, nextUnit: null, nextLevel: null };

  // Find the current lesson
  const currentLessonIndex = currentUnit.lessons.findIndex((lesson) => lesson.id === lessonId);
  if (currentLessonIndex === -1) return { nextLesson: null, nextUnit: null, nextLevel: null };

  // Case 1: Check for uncompleted and unlocked lessons within the SAME UNIT before the current lesson
  // This helps users complete the current unit before moving on
  for (let ln = 0; ln < currentLessonIndex; ln++) {
    const lesson = currentUnit.lessons[ln];

    // If we find an uncompleted and unlocked lesson in this unit, return it immediately
    if (!lesson.complete && !lesson.locked) {
      return {
        nextLesson: lesson,
        nextUnit: currentUnit,
        nextLevel: currentLevel
      };
    }
  }

  // Case 2: Next lesson in the current unit
  if (currentLessonIndex < currentUnit.lessons.length - 1) {
    const nextLesson = currentUnit.lessons[currentLessonIndex + 1];
    return {
      nextLesson,
      nextUnit: currentUnit,
      nextLevel: currentLevel
    };
  }

  // Case 3: First lesson in the next unit of current level
  const currentUnitIndex = currentLevel.units.indexOf(currentUnit);
  if (currentUnitIndex < currentLevel.units.length - 1) {
    const nextUnit = currentLevel.units[currentUnitIndex + 1];
    if (nextUnit.lessons && nextUnit.lessons.length > 0) {
      const nextLesson = nextUnit.lessons[0];
      return {
        nextLesson,
        nextUnit,
        nextLevel: currentLevel
      };
    }
  }

  // Case 4: First lesson in the first unit of the next level
  if (numLevelId < maxLevels) {
    const nextLevelIndex = levels.findIndex((level) => level.levelId === numLevelId + 1);
    if (nextLevelIndex !== -1) {
      const nextLevel = levels[nextLevelIndex];
      if (nextLevel.units && nextLevel.units.length > 0) {
        const nextUnit = nextLevel.units[0];
        if (nextUnit.lessons && nextUnit.lessons.length > 0) {
          const nextLesson = nextUnit.lessons[0];
          return {
            nextLesson,
            nextUnit,
            nextLevel
          };
        }
      }
    }
  }

  // If no next lesson found in any location
  return { nextLesson: null, nextUnit: null, nextLevel: null };
}
