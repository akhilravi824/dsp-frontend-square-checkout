<script lang="ts">
  import CaptionButton from '../buttons/CaptionButton.svelte';
  import FullscreenButton from '../buttons/FullscreenButton.svelte';
  import MuteButton from '../buttons/MuteButton.svelte';
  import PlayButton from '../buttons/PlayButton.svelte';
  import TimeSlider from '../sliders/TimeSlider.svelte';
  import VideoCaptions from '../VideoCaptions.svelte';

  interface Props {
    onclick?: () => void;
    thumbnails?: string;
    hasCaptions?: boolean;
  }

  const { onclick, thumbnails, hasCaptions }: Props = $props();
</script>

<media-controls class="vds-controls controls" data-visible="true">
  <media-controls-group
    class="vds-controls-group controls-group"
    style="
        --grid-template-columns: {hasCaptions ? '64px min-content auto 64px 64px' : '64px min-content auto 64px'};
        --grid-template-areas: {hasCaptions ? "'play mute time captions fullscreen'" : "'play mute time fullscreen'"}
    "
  >
    <PlayButton {onclick} />
    <MuteButton />
    <TimeSlider {thumbnails} />

    {#if hasCaptions}
      <CaptionButton />
    {/if}

    <VideoCaptions />

    <FullscreenButton />
  </media-controls-group>
</media-controls>

<style lang="scss">
  .controls {
    height: 100%;
  }

  .controls-group {
    height: 100%;
    display: flex;
    align-items: end;
  }

  .controls :global(media-time-slider) {
    --media-slider-height: 48px;
    --media-slider-track-border-radius: 60px;
    //--media-slider-focused-track-width: 80%;
    //padding-inline: 20px;
  }

  .controls :global(.vds-slider) {
    padding-inline: 20px;
  }

  .controls :global(.vds-button),
  .controls :global(.vds-slider) {
    border-radius: 99em;
    background: var(--color-dark-20);
    backdrop-filter: blur(14px);
    block-size: 48px;

    &:hover {
      transform: none;
    }
  }

  .controls :global(.vds-button) {
    --media-button-border-radius: 60px;
    width: auto;
    --media-button-padding: 0 12px;
  }

  .controls :global(media-time-slider media-slider-value) {
    background-color: unset;
  }

  .controls :global(media-volume-slider) {
    margin-left: 1.5px;
    max-width: 80px;
    --media-slider-height: 40px;
    --media-slider-preview-offset: 32px;
  }

  .controls-group {
    display: grid;
    grid-template-columns: var(--grid-template-columns, 64px min-content auto 64px);
    grid-template-areas: var(--grid-template-areas, 'play mute time captions fullscreen');
    gap: 2px;
    width: 100%;
    padding-inline: 16px;

    &:global(.icon) {
      --icon-color: var(--color-white-100);
    }

    &:last-child {
      margin-top: -4px;
      padding-bottom: 12px;
    }
  }

  :global(.lesson-page .controls-group:last-child) {
    margin-top: 0;
    padding: 0 32px 32px;
  }

  :global(.lesson-page.state-review .controls-group:last-child) {
    margin-top: 0;
    padding: 0 16px 16px;
  }
</style>
