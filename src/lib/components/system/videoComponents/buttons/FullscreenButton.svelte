<script lang="ts">
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
</script>

<media-fullscreen-button class="vds-button">
  <div class="vds-fs-enter-icon icon">
    <Icon type={ICONS.EXPAND} />
  </div>
  <div class="vds-fs-exit-icon icon">
    <Icon type={ICONS.COLLAPSE} />
  </div>
</media-fullscreen-button>

<style lang="scss">
  .vds-button > :global(.icon) {
    --icon-color: var(--color-white-100);
  }

  .vds-button {
    grid-area: fullscreen;
  }

  @media screen and (max-width: 600px) {
    .vds-button {
      display: none;
    }
  }
</style>
