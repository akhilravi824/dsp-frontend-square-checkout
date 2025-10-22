<script lang="ts">
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
</script>

<media-caption-button class="vds-button caption-button">
  <div class="vds-icon cc-on-icon">
    <Icon type={ICONS.SUBTITLES_ON} />
  </div>
  <div class="vds-icon cc-off-icon">
    <Icon type={ICONS.SUBTITLES_OFF} />
  </div>
</media-caption-button>

<style lang="scss">
  .caption-button {
    grid-area: captions;
  }

  .vds-icon {
    --icon-color: var(--color-white-100);
    place-items: center;
  }

  .cc-on-icon {
    display: none;
  }

  .cc-off-icon {
    display: grid;
  }

  :global(.caption-button[data-active]) {
    .cc-on-icon {
      display: grid;
    }

    .cc-off-icon {
      display: none;
    }
  }

  @media screen and (max-width: 600px) {
    .caption-button {
      display: none;
    }
  }
</style>
