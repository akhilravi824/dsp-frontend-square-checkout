import { fetchData } from '../sanityClient';
import { createDraftFilter, includeDrafts, ENVIRONMENT } from '../environment';

export async function fetchLesson(lessonId: string) {
  try {
    console.log(`Fetching lesson in ${ENVIRONMENT} environment`);

    // (kept in case you use it elsewhere)
    const draftFilter = createDraftFilter();

    const query = lessonQuery(lessonId);
    const pageData = await fetchData(query);

    // Prefer drafts when allowed
    if (includeDrafts && Array.isArray(pageData) && pageData.length > 0) {
      const draftPage = pageData.find((doc) => doc._id?.startsWith('drafts.'));
      return draftPage ? [draftPage] : pageData;
    }

    return pageData;
  } catch (error) {
    console.error(`Error fetching lesson:`, error);
    return [];
  }
}

/**
 * Fetch one lessonPage by its id.current with tips.
 * IMPORTANT: Projects image blocks to include a real "src" (asset->url) so GIFs animate.
 */
export const lessonQuery = (lessonId: string) => `
  *[_type == "lessonPage" && id.current == '${lessonId}'][0] {
    _id,
    title,
    "id": id.current,
    "icon": icon-> {
      "id": id,
      "title": title
    },
    "video": {
      _key,
      "assetId": video.asset->assetId,
      "playbackId": video.asset->playbackId,
      "filename": video.asset->filename,
      "status": video.asset->status,
      "duration": video.asset->data.duration,
      "aspectRatio": video.asset->data.aspect_ratio,
      "thumbTime": video.thumbTime,
      "title": video.title,
      "subtitleFile": subtitleFile.asset->url,
      "subtitleLanguage": subtitleFile.language,
      "streamingUrl": video.asset->playbackId + "/high.mp4",
      "thumbnailUrl": video.asset->thumbUrl,
      "posterUrl": video.asset->thumbUrl
    },

    // Tips (dereferenced). 'description' is a Portable Text array.
    "tips": tips[]-> {
      _id,
      title,
      "description": description[] {
        ...,

        // Keep rich-text blocks + links
        _type == "block" => {
          ...,
          markDefs[] {
            ...,
            _type == "link" => {
              ...,
              "href": href
            }
          }
        },

        // ✅ Add image/GIF projection with original file URL
        _type == "image" => {
          _type,
          alt,
          "src": asset->url
        }

        // (Optional) If you later add mux.video blocks, you can also handle them here.
        // _type == "mux.video" => {
        //   _type,
        //   "playbackId": asset->playbackId
        // }
      }
    }
  }
`;
