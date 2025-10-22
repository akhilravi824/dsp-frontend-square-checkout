<script lang="ts">
  import type { TooltipPlacement } from 'vidstack';

  import MenuRadio from './MenuRadio.svelte';
  import Submenu from './Submenu.svelte';
  import SubmenuButton from './SubmenuButton.svelte';
  import Tooltip from '../Tooltip.svelte';
</script>

<media-caption-menu class="vds-menu">
  <media-menu-button class="vds-menu-button vds-button">
    <media-icon type="closed-captions" />
  </media-menu-button>
  <media-menu-items class="vds-menu-items">
    <media-caption-menu-item value="off">
      <media-icon type="closed-captions" />
      <span>Off</span>
    </media-caption-menu-item>
    <media-caption-menu-item value="on">
      <media-icon type="closed-captions-on" />
      <span>On</span>
    </media-caption-menu-item>
  </media-menu-items>
</media-caption-menu>
