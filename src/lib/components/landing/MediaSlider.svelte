<script lang="ts">
  import { breakpoints } from '$lib/stores/mediaQueries.svelte';
  import RichText from '../system/RichText.svelte';
  import Media from './Media.svelte';
  import IntersectionObserver from '../utils/IntersectionObserver.svelte';
  import { HLSManager } from '$lib/utils/hlsManager';
  const { data, class: className } = $props();

  // Active media option (default to first one)
  let activeMediaId = $state(-1);
  let mediaRef = $state<Media[]>([]);
  let videoRef = $state<HTMLVideoElement[]>([]);
  let intersecting = $state(false);

  // HLS manager instance
  const hlsManager = new HLSManager();

  // Helper function to check if media is a muted video
  function isMutedVideo(media: any): boolean {
    return media.mediaType === 'video' && media.video?.autoplay === true;
  }

  // Initialize HLS when videos are mounted
  $effect(() => {
    if (data.media) {
      data.media.forEach((slide: any, index: number) => {
        if (isMutedVideo(slide.media) && videoRef[index]) {
          const src = `https://stream.mux.com/${slide.media.video.playbackUrl}.m3u8`;

          // Initialize desktop video only (mobile uses Media component)
          setTimeout(() => {
            hlsManager.initializeHLS(videoRef[index], src, index);
          }, 100);
        }
      });
    }

    // Cleanup on unmount
    return () => {
      hlsManager.cleanupAll();
    };
  });

  // Function to change the active media
  function setActiveMedia(idx: number): void {
    if (breakpoints.mobile.mediaQuery) return;
    if (activeMediaId === idx) return;

    const currentMedia = data.media[idx].media;

    // Handle new active media
    if (isMutedVideo(currentMedia) && hlsManager.isSupported(idx) !== false) {
      // For native video elements (when HLS is supported)
      hlsManager.playVideo(idx);
    }

    // Handle previous active media
    if (activeMediaId !== -1) {
      const previousMedia = data.media[activeMediaId].media;
      if (isMutedVideo(previousMedia) && hlsManager.isSupported(activeMediaId) !== false) {
        // For native video elements (when HLS is supported)
        hlsManager.pauseVideo(activeMediaId);
      }
    }

    activeMediaId = idx;
  }

  // Handle intersection enter to play the first video
  function handleIntersectionEnter(intersecting: boolean) {
    if (intersecting && data.media?.length > 0) {
      setActiveMedia(0);
    }
  }
</script>

<section class="media-slider {className}">
  <div class="layout:max-width">
    <div class="layout:grid space:d64">
      <div class="section-header">
        <h2 class="type:h1">{data.title}</h2>
      </div>
      {#if data.copy}
        <div class="section-body">
          <RichText copy={data.copy} bodyTypeClass="type:body-large" />
        </div>
      {/if}
    </div>
    <div class="media-section">
      {#if data.media}
        {#if !breakpoints.mobile.mediaQuery}
          <IntersectionObserver bind:intersecting onEnter={handleIntersectionEnter}>
            <div class="media-display layout:zstack box-rounded:lg">
              {#each data.media as slide, index (slide.title)}
                <div class="media-wrapper box-rounded:lg" class:active={activeMediaId === index}>
                  {#if isMutedVideo(slide.media) && hlsManager.isSupported(index) !== false}
                    <!-- Native video element for muted videos when HLS is supported -->
                    <video
                      bind:this={videoRef[index]}
                      poster={`https://image.mux.com/${slide.media.video.playbackUrl}/thumbnail.jpg`}
                      muted={true}
                      loop={slide.media.video.loop}
                      playsinline
                      style="aspect-ratio: {slide.media.video.aspectRatio.replace(':', '/')}"
                    ></video>
                  {:else}
                    <Media bind:this={mediaRef[index]} media={slide.media} />
                  {/if}
                </div>
              {/each}
            </div>
          </IntersectionObserver>
        {/if}

        <div class="texts-display layout:grid" style="--slider-items: {data.media.length}">
          {#each data.media as slide, index (slide.title)}
            <div style="display: flex;">
              {#if breakpoints.mobile.mediaQuery}
                <div class="media-wrapper box-rounded:lg">
                  <Media media={slide.media} />
                </div>
              {/if}

              <div
                class="text-cta rich-text"
                class:active={activeMediaId === index}
                onclick={() => setActiveMedia(index)}
                onkeydown={() => setActiveMedia(index)}
                role="button"
                tabindex="0"
              >
                <RichText copy={slide.copy} class="type:body" />
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</section>

<style lang="scss">
  .media-slider {
    .media-section {
      display: flex;
      flex-direction: column;
    }
  }

  .section-header,
  .section-body {
    grid-column: 1 / -1;
  }

  .section-header {
    margin-block-end: var(--space-24);
  }

  @media screen and (min-width: 834px) {
    .section-header {
      grid-column: 1 / span 4;
      margin-block-end: 0;
    }

    .section-body {
      grid-column: 7 / span 6;
    }
  }

  .media-display {
    width: 100%;
    background-color: var(--color-dark-5);

    .media-wrapper {
      aspect-ratio: 16/9;
      inline-size: 100%;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 0.3s ease-in-out,
        visibility 0.3s ease-in-out;

      :global(.image-wrapper) {
        object-fit: cover;
      }
      &.active {
        opacity: 1;
        visibility: visible;
      }

      :global(.media),
      :global(.media img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      }
    }
  }

  .texts-display {
    & > div {
      grid-column: 1 / -1;
      position: relative;

      @media screen and (min-width: 768px) {
        grid-column: span calc(12 / var(--slider-items)) / auto;
      }

      &:last-child .text-cta {
        @media screen and (max-width: 768px) {
          padding-block-end: 0;
        }
      }

      .media-wrapper {
        @media screen and (max-width: 767px) {
          video {
            aspect-ratio: var(--aspect-ratio, 16/9);
            width: 100%;
            border-radius: var(--border-radius-lg);
          }
        }
      }
    }

    .text-cta {
      grid-column: 1 / -1;
      padding-right: 32px;
      padding-top: 16px;
      padding-bottom: 32px;
      position: relative;
      color: var(--color-dark-60);
      outline: none;

      @media screen and (min-width: 768px) {
        grid-column: span calc(12 / var(--slider-items)) / auto;
        cursor: pointer;
        padding-top: 32px;
        padding-bottom: 40px;
      }

      :global(strong) {
        --strong-color: var(--color-dark-100);
        transition: color 0.2s ease-in-out;

        @media screen and (min-width: 768px) {
          --strong-color: var(--color-dark-60);
        }
      }

      @media screen and (min-width: 768px) {
        &:before {
          content: '';
          background: var(--color-dark-20);
          block-size: 2px;
          position: absolute;
          bottom: 0;
          left: calc(var(--grid-gap) / 2 * -1);
          width: calc(100% + var(--grid-col-gap) / 2);
        }
      }

      &:nth-child(1):before {
        left: 0;
      }

      @media (hover: hover) and (pointer: fine) {
        &:hover,
        &:focus,
        &.active {
          color: var(--color-dark-60);

          :global(strong) {
            --strong-color: var(--color-dark-100);
          }
        }

        &.active {
          opacity: 1;

          &:before {
            background: var(--color-dark-100);
          }
        }
      }
    }
  }
</style>
