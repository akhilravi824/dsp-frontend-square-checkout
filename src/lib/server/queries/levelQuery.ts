import { fetchData } from '../sanityClient';
import { createDraftFilter, includeDrafts, ENVIRONMENT } from '../environment';

export async function fetchLevels(learningType: string) {
  try {
    console.log(`Fetching page with levels in ${ENVIRONMENT} environment`);

    // Get the appropriate draft filter based on environment
    const draftFilter = createDraftFilter();

    // The main page query with appropriate draft filtering
    const query = allLevelsWithUnitsQuery(learningType);

    // console.log('query', query);

    // Call fetchData with the levelId parameter - this will replace $levelId in the GROQ query
    const pageData = await fetchData(query);

    // console.log('qdwwdqwdqw ', pageData);

    // In dev/staging, we prioritize draft content over published
    if (includeDrafts && Array.isArray(pageData) && pageData.length > 0) {
      // Find a draft document first, fallback to any document
      const draftPage = pageData.find((doc) => doc._id?.startsWith('drafts.'));
      return draftPage ? [draftPage] : pageData;
    }

    return pageData;
  } catch (error) {
    console.error(`Error fetching levels:`, error);
    return [];
  }
}

const levelFields = `
  _id,
  title,
  levelId,
  "slug": slug.current,
  // Expand units references
  "units": units[]-> {
    _id,
    title,
    unitId,
    description,
    // Get lessons referenced by this unit (correct relationship direction)
    "lessons": lessons[]-> {
      _id,
      title,
      "id": id.current,
      "icon": icon-> {
        "id": id,
        "title": title
      },
    }
  } | order(unitId asc),
  "image": image.asset->{
    "url": url,
    "assetId": _id,
    "metadata": metadata,
    "dimensions": metadata.dimensions,
    "lqip": metadata.lqip
  }
`;

/**
 * Get all level pages with their units and lessons count
 */
export const allLevelsWithUnitsQuery = (learningType: string) => `
  *[_type == "levelPage" && '${learningType}' in learningType] | order(levelId asc) {
    ${levelFields}
  }
`;

/**
 * Get a single lesson with its parent unit and level information
 */
export const lessonWithParentsQuery = `
  *[_type == "lessonPage" && _id == $lessonId][0] {
    _id,
    title,
    vimeoId,
    "slug": slug.current,
    // Find the unit that references this lesson
    "unit": *[_type == "unit" && references(^._id)][0] {
      _id,
      title,
      unitNumber,
      // Find the level that references this unit
      "level": *[_type == "levelPage" && references(^._id)][0] {
        _id,
        title,
        levelId,
        "slug": slug.current
      }
    }
  }
`;

/**
 * Get the navigation structure for all levels, units, and lessons
 */
export const fullCurriculumStructureQuery = `
  {
    "levels": *[_type == "levelPage"] | order(levelId asc) {
      _id,
      title,
      levelId,
      "slug": slug.current,
      "units": units[]-> | order(unitNumber asc) {
        _id,
        title,
        unitNumber,
        "lessons": *[_type == "lessonPage" && references(^._id)] | order(lessonNumber asc) {
          _id,
          title,
          "slug": slug.current
        }
      }
    }
  }
`;
