<script lang="ts">
  import VideoPlayer from '$lib/components/system/VideoPlayer.svelte';
  import type { Media } from '../../../types/sanity.types';

  let instance: HTMLImageElement | VideoPlayer | null = $state(null);

  const { media }: { media: Media } = $props();

  export function getInstance() {
    return instance;
  }
</script>

{#snippet mediaImage(image: { assetUrl: string; alt?: string })}
  <div class="image-wrapper">
    <img bind:this={instance} src={image.assetUrl} alt={image.alt} />
  </div>
{/snippet}

{#snippet mediaVideo(video: {
  playbackUrl: string;
  aspectRatio: string;
  subtitleFile?: string;
  subtitleLanguage?: string;
  autoplay?: boolean;
  loop?: boolean;
})}
  <div class="video-wrapper">
    <VideoPlayer
      bind:this={instance}
      autoplay={video.autoplay}
      loop={video.loop}
      muted={video.autoplay}
      playbackId={video.playbackUrl}
      aspectRatio={video.aspectRatio}
      subtitleFile={video.subtitleFile}
      subtitleLanguage={video.subtitleLanguage}
    />
  </div>
{/snippet}

{#snippet renderMedia(media: {
  _id: string;
  title?: string;
  mediaType?: 'image' | 'video';
  image?: {
    assetUrl: string;
    alt?: string;
  };
  video?: {
    playbackUrl: string;
    aspectRatio: string;
    subtitleFile?: string;
    subtitleLanguage?: string;
  };
})}
  {#if media.mediaType === 'image'}
    {@render mediaImage(media.image!)}
  {:else if media.mediaType === 'video'}
    {@render mediaVideo(media.video!)}
  {/if}
{/snippet}

<div class="media">
  {@render renderMedia(media)}
</div>
