<script lang="ts">
  import type { IconType } from '../system/icons/types';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import Button from '$lib/components/system/Button.svelte';

  type LessonData = {
    id: string;
    title: string;
    level: string;
    unit: string;
    lessonData: string;
    complete: boolean;
    current: boolean;
    locked: boolean;
    attempts: number;
    icon?: { id: keyof typeof ICONS };
  };

  type LessonButtonProps = {
    lessonData?: LessonData;
    levelId?: string;
    unitId?: string;
  };

  const {
    lessonData = {
      id: '',
      title: '',
      level: '',
      unit: '',
      lessonData: '',
      complete: false,
      current: false,
      locked: false,
      attempts: 0
    },
    levelId = '',
    unitId = ''
  }: LessonButtonProps = $props();

  const { current, locked, complete } = lessonData;

  const getIconKey = () => {
    if (current) return 'PLAY';
    if (locked) return 'LOCK';
    if (complete) return 'CHECK';
    return 'PLAY';
  };

  const getButtonText = () => {
    if (current) return 'Start';
    if (locked) return 'Locked';
    if (complete) return 'Practice';
    return 'Start';
  };

  let previewHovered = $state(false);

  const icon = getIconKey();
  const text = getButtonText();
  const href: string = lessonData.locked ? '' : `/levels/${levelId}/units/${unitId}/lessons/${lessonData.id}`;
  const tagType = href ? 'a' : 'button';
  const displayIcon = $derived(previewHovered && icon === 'CHECK' ? 'PLAY' : icon);

  function onPreviewFocus() {
    previewHovered = true;
  }

  function onPreviewBlur() {
    previewHovered = false;
  }
</script>

<div>
  <svelte:element
    this={tagType}
    class="lesson-button box-rounded:sm"
    class:completed={lessonData.complete}
    class:unlocked={!lessonData.locked}
    class:locked={lessonData.locked}
    {href}
    role="button"
    tabindex="0"
    onmouseenter={onPreviewFocus}
    onmouseleave={onPreviewBlur}
  >
    {#if lessonData.icon}
      <span class="icon-left">
        <Icon type={ICONS[lessonData.icon.id]} />
      </span>
    {/if}
    <span class="title type:lesson-title">
      {lessonData.title}
      {#if (lessonData.attempts > 1 && lessonData.complete) || (lessonData.attempts > 0 && !lessonData.complete)}
        <span class="attempts type:label">
          {lessonData.attempts} attemps
        </span>
      {/if}
    </span>

    <Button
      icon={ICONS[displayIcon]}
      iconPosition="after"
      variant="primary"
      size="small"
      alignment="right"
      hovered={previewHovered}
    >
      <span>{text}</span>
    </Button>
  </svelte:element>
</div>

<style lang="scss">
  .lesson-button {
    padding: 0 24px;
    border-radius: var(--sm, 12px);
    border: 1px solid var(--color-white-100);
    display: flex;
    color: var(--color-dark-60);
    text-decoration: none;
    height: 74px;
    align-items: center;
    width: 100%;
    background: transparent;
    text-align: left;
    --btn-fill: transparent;
    --btn-fill-hover: transparent;

    :global(.icon) {
      --icon-color: var(--color-dark-20);
    }

    &.unlocked,
    &.completed {
      color: var(--color-dark-100);
      background-color: var(--color-white-100);
      --btn-fill: var(--color-white-100);
      --btn-fill-hover: var(--color-white-100);
      pointer-events: auto;
    }

    &.completed,
    &.unlocked {
      .icon-left {
        --icon-color: var(--color-dark-100);
      }
    }

    &.unlocked {
      --btn-fill: var(--color);
      --btn-fill-hover: var(--color);

      :global(.icon) {
        --icon-color: var(--color-white-100);
      }
    }

    &.locked {
      border-color: var(--color-dark-10);
      padding: 0 12px 0 24px;

      &:hover {
        border-color: var(--color-dark-20);

        :global(.icon) {
          --icon-color: var(--color-dark-60);
        }

        :global(.btn-text),
        :global(.button) {
          color: var(--color-dark-60);
          --btn-hover-layer-bg: transparent;
          --btn-fill: transparent;
          --btn-fill-hover: transparent;
        }
      }
    }

    &.completed {
      --btn-fill: #e9e9ec; // solid variant for var(--color-dark-10)
      --btn-fill-hover: #e9e9ec;

      :global(.btn-text) {
        color: var(--color-dark-100);
      }

      :global(.icon) {
        color: var(--color-dark-100);
        --icon-color: var(--color-dark-100);
      }
    }

    .icon-left {
      --icon-color: var(--color-dark-20);
      margin-right: 8px;
    }

    .title {
      flex: 1;
      text-transform: lowercase;
    }

    .attempts {
      margin-left: 8px;
      color: var(--color-dark-60);
    }
  }

  :global(.locked .button .btn-text) {
    color: var(--color-dark-20);
  }
</style>
