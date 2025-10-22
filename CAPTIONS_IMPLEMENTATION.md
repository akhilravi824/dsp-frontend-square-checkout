# Captions/Subtitles Implementation for Vidstack Video Player

This document describes the implementation of captions/subtitles support for the vidstack video player component in the DSP frontend.

## Overview

The implementation adds support for WebVTT (.vtt) subtitle files in the video player, allowing users to enable/disable captions and providing a better accessibility experience.

## Sanity Schema Changes

The `media` document type in Sanity has been updated to include subtitle file support:

```typescript
defineField({
  name: "subtitleFile",
  title: "Subtitle File (.vtt only)",
  type: "file",
  hidden: ({ parent }) => parent?.mediaType !== "video",
  options: {
    accept: ".vtt",
  },
  fields: [
    {
      name: "language",
      type: "string",
      title: "Language Code (e.g., en, da)",
    },
  ],
}),
```

## Implementation Details

### 1. Media Query Updates

**File:** `src/lib/server/queries/molecules/mediaQuery.ts`

Updated the `mediaSpreadQuery` to include subtitle data:

```typescript
mediaType == "video" => {
  "video": {
    // ... existing video fields
    "subtitleFile": subtitleFile.asset->url,
    "subtitleLanguage": subtitleFile.language
  }
}
```

### 2. VideoPlayer Component

**File:** `src/lib/components/system/VideoPlayer.svelte`

- Added `subtitleFile` and `subtitleLanguage` props
- Implemented conditional rendering of `<media-captions>` element
- Uses vidstack's native caption support with `<media-caption>` elements

```svelte
{#if subtitleFile}
  <media-captions>
    <media-caption 
      src={subtitleFile} 
      language={subtitleLanguage || 'en'}
      default
    ></media-caption>
  </media-captions>
{/if}
```

### 3. VideoLayout Component

**File:** `src/lib/components/system/videoComponents/layouts/VideoLayout.svelte`

- Added `hasCaptions` prop to conditionally show the caption button
- Dynamic grid layout that adjusts based on caption availability
- Uses CSS custom properties for responsive grid template columns

### 4. Media Component

**File:** `src/lib/components/landing/Media.svelte`

- Updated to pass subtitle data to VideoPlayer component
- Added proper TypeScript types for media objects

### 5. Lesson Query Updates

**File:** `src/lib/server/queries/lessonQuery.ts`

Updated lesson queries to include subtitle data for lesson videos.

## Usage

### For Content Creators

1. Upload a .vtt subtitle file in Sanity Studio
2. Set the language code (e.g., "en" for English, "da" for Danish)
3. The captions will automatically appear in the video player

### For Developers

The VideoPlayer component now accepts subtitle props:

```svelte
<VideoPlayer 
  playbackId="your-playback-id"
  aspectRatio="16:9"
  subtitleFile="https://cdn.sanity.io/files/.../subtitles.vtt"
  subtitleLanguage="en"
/>
```

## Features

- **Automatic Detection**: Caption button only appears when subtitle files are available
- **Language Support**: Supports multiple languages with proper language codes
- **Accessibility**: Follows vidstack's accessibility guidelines
- **Responsive Design**: Caption controls adapt to the available space
- **Default State**: Captions can be set to display by default

## Technical Notes

- Uses WebVTT format for subtitle files
- Leverages vidstack's built-in caption functionality
- Maintains backward compatibility with existing video content
- TypeScript types are properly defined for all new props
- CSS custom properties used for dynamic styling

## Browser Support

- Modern browsers with vidstack support
- WebVTT format is widely supported
- Graceful degradation when captions are not available 