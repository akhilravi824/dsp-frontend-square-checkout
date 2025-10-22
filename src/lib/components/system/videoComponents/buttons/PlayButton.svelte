<script lang="ts">
  import Icon from '$lib/components/system/icons/Icon.svelte';

  import { ICONS } from '$lib/components/system/icons/types';

  interface Props {
    onclick?: () => void;
  }

  const { onclick }: Props = $props();
</script>

<media-play-button
  class="vds-button"
  {onclick}
  role="button"
  tabindex="0"
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onclick && onclick()}
>
  <div class="vds-play-icon icon">
    <Icon type={ICONS.PLAY} />
  </div>
  <div class="vds-pause-icon icon">
    <Icon type={ICONS.PAUSE} />
  </div>
  <div class="vds-replay-icon icon">
    <Icon type={ICONS.PLAY} />
  </div>
</media-play-button>

<style lang="scss">
  .vds-button {
    grid-area: play;

    --media-button-padding: 0 12px;
    height: 48px;
    width: auto;
    background: var(--color-dark-20);
    backdrop-filter: blur(14px);
    --media-button-border-radius: 60px;
    --icon-color: var(--color-white-100);
  }

  .vds-button > :global(.icon) {
    --icon-color: var(--color-white-100);
  }
</style>
