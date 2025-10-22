export const mediaSpreadQuery = `
  ...select(
    mediaType == "image" => {
      "image": {
        "url": image.asset->url,
        "assetId": image.asset->_id,
        "assetUrl": image.asset->url,
        "metadata": image.asset->metadata,
        "alt": image.alt,
        "dimensions": image.asset->metadata.dimensions,
        "lqip": image.asset->metadata.lqip
      }
    },
    mediaType == "video" => {
      "video": {
        "assetId": video.asset->_id,
        "assetUrl": video.asset->url,
        "playbackUrl": video.asset->playbackId,
        "thumbnailUrl": video.asset->thumbUrl,
        "duration": video.asset->data.duration,
        "muxAssetId": video.asset->assetId,
        "aspectRatio": video.asset->data.aspect_ratio,
        "subtitleFile": subtitleFile.asset->url,
        "subtitleLanguage": subtitleFile.language,
        "autoplay": autoplay,
        "loop": loop
      }
    }
  )
`;

export const mediaQuery = `
  media->{
    _id,
    title,
    mediaType,
    ${mediaSpreadQuery}
  }
`;

export const mediaArrayQuery = `
  "media": media[]{
    _key,
    title,
    copy,
    "media": ${mediaQuery}
  }
`;
