<script lang="ts">
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import VolumeSlider from '$lib/components/system/videoComponents/sliders/VolumeSlider.svelte';
</script>

<media-mute-button class="vds-button mute-button">
  <div class="mute">
    <div class="vds-mute-icon icon">
      <Icon type={ICONS.VOLUME_OFF} />
    </div>

    <div class="vds-volume-low-icon icon">
      <Icon type={ICONS.VOLUME_ON} />
    </div>

    <div class="vds-volume-high-icon icon">
      <Icon type={ICONS.VOLUME_ON} />
    </div>
  </div>

  <div class="volume">
    <VolumeSlider />
  </div>
</media-mute-button>

<style lang="scss">
  .mute-button {
    grid-area: mute;
    line-height: 0 !important;
    --icon-color: var(--color-white-100);

    &:hover,
    &:focus,
    &:active {
      .volume {
        display: block;
      }
    }
  }

  .mute {
    display: flex;
    justify-content: center;
    width: 40px;
  }

  .volume {
    display: none;
  }

  @media screen and (max-width: 600px) {
    .mute-button {
      display: none;
    }
  }
</style>
