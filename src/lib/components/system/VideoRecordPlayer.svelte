<script lang="ts">
  import 'vidstack/player/styles/default/theme.css';
  import 'vidstack/player';
  import 'vidstack/player/ui';
  import 'vidstack/icons';
  import type { MediaPlayerElement } from 'vidstack/elements';

  import { isMobile } from '$lib/utils/device';
  import VideoLayout from '$lib/components/system/videoComponents/layouts/VideoLayout.svelte';
  import { onMount, createEventDispatcher } from 'svelte';
  import { createVideoPlayerBase } from './videoComponents/VideoPlayerBase';

  export let src: string = '';
  export let aspectRatio: string = '4/3';
  export let type: string = 'video/webm';
  export let duration: number = 0;

  export let loop = false;
  export let autoplay = false;
  export let playerId: string = 'record-player';

  const dispatch = createEventDispatcher();
  const basePlayer = createVideoPlayerBase({ dispatch });
  export const playVideo = () => basePlayer.playVideo(player);
  export const pauseVideo = () => basePlayer.pauseVideo(player);
  export const seekVideo = (time: number) => basePlayer.seekVideo(player, time);
  export const restart = () => basePlayer.restart(player);

  let player: MediaPlayerElement;
  let mobile = false;

  onMount(() => {
    mobile = isMobile();

    if (player) {
      forceOnDemandMode();
      player.addEventListener('can-play', forceOnDemandMode);
      player.addEventListener('loadedmetadata', forceOnDemandMode);
    }

    // Set up the player and hover controls
    const playerCleanup = basePlayer.setupPlayer(player);
    const hoverCleanup = basePlayer.setupHoverControls(player);

    return () => {
      playerCleanup();
      hoverCleanup();

      // Remove specific event listeners
      if (player) {
        player.removeEventListener('can-play', forceOnDemandMode);
        player.removeEventListener('loadedmetadata', forceOnDemandMode);
      }
    };
  });

  function forceOnDemandMode() {
    if (!player) return;

    player.duration = duration;
    player.setAttribute('stream-type', 'on-demand');

    if (player.hasAttribute('live')) {
      player.removeAttribute('live');
    }
    player.dispatchEvent(new Event('durationchange'));
  }

  function onClick() {
    if (!mobile) return;

    if (player) {
      player.currentTime = 0;
      player.enterFullscreen();
      player.play();
    }
  }
</script>

<div class="video-wrapper box-rounded:lg" style="--aspect-ratio: {aspectRatio.replace(':', '/')};">
  <media-player bind:this={player} class="player" crossOrigin playsInline title="Video" {loop} {autoplay} id={playerId}>
    <media-provider>
      <source {src} {type} />
    </media-provider>

    <VideoLayout onclick={onClick} thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" />
  </media-player>
</div>

<style lang="scss">
  .video-wrapper {
    aspect-ratio: var(--aspect-ratio);
    inline-size: 100%;
  }

  .player {
    --media-brand: #f5f5f5;
    --media-focus-ring: 0 0 0 3px var(--media-focus-ring-color);
    --media-focus-ring-color: #4e9cf6;
    display: block;
    width: 100%;
    height: 100%;

    /* svelte-ignore css-unused-selector */
    &:global([data-view-type='video']) {
      aspect-ratio: var(--aspect-ratio);
      border-radius: var(--media-border-radius);
      contain: style;
      --media-menu-y-offset: 30px;
      --media-tooltip-y-offset: 30px;
    }

    & :global(video) {
      border-radius: var(--media-border-radius);
      height: 100%;
    }
  }

  /* Controls visibility based on hover state */
  :global(media-player:not([data-visible])) :global(.vds-controls) {
    opacity: 0 !important;
    visibility: hidden !important;
    transition:
      opacity 0ms,
      visibility 0ms !important;
  }
</style>
