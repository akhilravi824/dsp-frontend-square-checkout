<script lang="ts">
  import CircleProgress from '$lib/components/system/CircleProgress.svelte';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import type { IconType } from '$lib/components/system/icons/types';

  // Temporary props. Update with actual data when available.
  interface Props {
    level: number;
    label: string;
    icon?: IconType;
    completed?: boolean;
    progress?: number;
  }

  const { level, label, icon, completed, progress }: Props = $props();
</script>

<div class="level layout:inline-flex box-rounded:md {`level-${level}`} {completed ? 'completed' : ''}">
  <div class="type:h4">Level {level}</div>
  <div class="layout:inline-flex level-status">
    <div class="type:label text-color:dark-60">{label}</div>
    {#if icon}
      <Icon type={icon} />
    {:else}
      <CircleProgress size={20} strokeWidth={3} {progress} />
    {/if}
  </div>
</div>

<style lang="scss">
  .level {
    --inline-justify: space-between;

    height: 84px;
    padding-inline: var(--space-d32);
  }

  .level-status {
    --gap: var(--space-d12);

    :global(.progress-bar) {
      --progress-color: var(--color-dark-100);
    }
  }

  .level-1 {
    background: var(--color-theme-1-gradient-bg);
    color: var(--color-spot-1);

    &.completed {
      background: var(--color-theme-1-base);
    }
  }

  .level-2 {
    background: var(--color-theme-2-gradient-bg);
    color: var(--color-spot-2);

    &.completed {
      background: var(--color-theme-2-base);
    }
  }

  .level-3 {
    background: var(--color-theme-3-gradient-bg);
    color: var(--color-spot-3);

    &.completed {
      background: var(--color-theme-3-base);
    }
  }

  .level-4 {
    background: var(--color-theme-4-gradient-bg);
    color: var(--color-spot-1);

    &.completed {
      background: var(--color-theme-4-base);
    }
  }

  .level-5 {
    background: var(--color-theme-5-gradient-bg);
    color: var(--color-spot-3);

    &.completed {
      background: var(--color-theme-5-base);
    }
  }
</style>
