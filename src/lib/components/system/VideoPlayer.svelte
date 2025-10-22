<script lang="ts">
  import { speedControl } from '$lib/actions/speedControl';
  import 'vidstack/player/styles/default/theme.css';
  import 'vidstack/player';
  import 'vidstack/player/ui';
  import 'vidstack/icons';
  import type { MediaPlayerElement } from 'vidstack/elements';
  import { isMobile } from '$lib/utils/device';
  import VideoLayout from '$lib/components/system/videoComponents/layouts/VideoLayout.svelte';
  import { onMount, createEventDispatcher } from 'svelte';
  import { createVideoPlayerBase, type VideoPlayerBaseProps } from './videoComponents/VideoPlayerBase';

  let {
    playbackId = '',
    src = '',
    aspectRatio = '4/3',
    type = 'video/webm',
    playerId = 'instruction-player',
    loop = false,
    autoplay = false,
    subtitleFile = undefined,
    subtitleLanguage = undefined,
    muted = false,
  
    // ✅ new props in runes mode:
    enableSpeedControl = false,
    speedOptions = { speeds: [0.5, 1, 1.5, 2], defaultRate: 1 }
  }: {
    playbackId?: string;
    src?: string;
    aspectRatio?: string;
    type?: string;
    playerId?: string;
    loop?: boolean;
    autoplay?: boolean;
    subtitleFile?: string;
    subtitleLanguage?: string;
    muted?: boolean;
  
    // (optional typing)
    enableSpeedControl?: boolean;
    speedOptions?: { speeds?: number[]; defaultRate?: number };
  } = $props();

  const dispatch = createEventDispatcher();
  let player: MediaPlayerElement;
  let poster = playbackId ? `https://image.mux.com/${playbackId}/thumbnail.jpg` : '';
  let mobile = false;
  let hasStartedPlaying = false;

  // Create a mock component object that matches what VideoPlayerBase expects
  const mockComponent = {
    dispatch,
    $$prop_def: {},
    $$events_def: {},
    $$slot_def: {},
    $destroy: () => {},
    $on: () => {},
    $set: () => {}
  };

  // Create base player functionality
  const basePlayer = createVideoPlayerBase(mockComponent as any);

  // Export control methods for external use
  export const playVideo = () => basePlayer.playVideo(player);
  export const pauseVideo = () => basePlayer.pauseVideo(player);
  export const seekVideo = (time: number) => basePlayer.seekVideo(player, time);
  export const restart = () => basePlayer.restart(player);

  if (playbackId && !src) {
    src = `https://stream.mux.com/${playbackId}.m3u8`;
    type = 'application/x-mpegurl';
  }

  onMount(() => {
    mobile = isMobile();

    // Set up the player
    const playerCleanup = basePlayer.setupPlayer(player);

    // Custom controls visibility setup (replaces setupHoverControls)
    const controlsCleanup = setupCustomControls(player);

    setTimeout(() => {
      if (player) {
        player.muted = true;
        player.volume = 0; // optional
      }
    }, 0);

    return () => {
      if (playerCleanup) playerCleanup();
      if (controlsCleanup) controlsCleanup();
    };
  });

  function setupCustomControls(player: MediaPlayerElement | null | undefined) {
    if (!player) return () => {};

    // Initially show controls until first play
    player.setAttribute('data-visible', '');
    player.setAttribute('data-show-until-play', '');

    let fadeoutTimer: ReturnType<typeof setTimeout> | null = null;

    // Handle play event to hide controls after first play
    const handlePlay = () => {
      if (!hasStartedPlaying) {
        hasStartedPlaying = true;
        player.removeAttribute('data-show-until-play');

        // Add a delay before switching to hover behavior
        fadeoutTimer = setTimeout(() => {
          // Remove the visible attribute to allow controls to fade out
          if (!mobile) {
            player.removeAttribute('data-visible');
            setupHoverBehavior(player);
          }
        }, 2000); // 2 second delay before fadeout
      }
    };

    player.addEventListener('play', handlePlay);

    // For mobile, keep controls visible
    if (mobile) {
      player.setAttribute('data-visible', '');
    }

    return () => {
      player.removeEventListener('play', handlePlay);
      if (fadeoutTimer) {
        clearTimeout(fadeoutTimer);
      }
    };
  }

  function setupHoverBehavior(player: MediaPlayerElement) {
    const container = player.closest('.video-wrapper');
    if (!container) return;

    const handleMouseEnter = () => {
      player.setAttribute('data-visible', '');
    };

    const handleMouseLeave = () => {
      player.removeAttribute('data-visible');
      player.dispatchEvent(new CustomEvent('user-inactive'));
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup function would be handled by onMount's return
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
  <media-player
      use:speedControl={enableSpeedControl ? speedOptions : undefined}
      bind:this={player}
      class="player"
      crossOrigin
      playsInline
      title="Video"
      {loop}
      data-idle-delay="300"
      {muted}
      data-muted={muted}
  >
    <media-provider>
      <source {src} {type} />

      {#if poster}
        <media-poster alt="Video thumbnail" class="vds-poster" src={poster}></media-poster>
      {/if}
      {#if subtitleFile}
        <track src={subtitleFile} kind="subtitles" srclang={subtitleLanguage} default />
        <media-captions class="vds-captions"> </media-captions>
      {/if}
    </media-provider>

    <VideoLayout
      onclick={onClick}
      thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
      hasCaptions={!!subtitleFile}
    />
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

  .vds-poster :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Show controls until first play, then use hover behavior */
  :global(media-player[data-show-until-play]) :global(.vds-controls) {
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* Controls visibility based on hover state (after first play) */
  :global(media-player:not([data-visible]):not([data-show-until-play])) :global(.vds-controls) {
    opacity: 0 !important;
    visibility: hidden !important;
    transition:
      opacity 0ms,
      visibility 0ms !important;
  }
</style>
