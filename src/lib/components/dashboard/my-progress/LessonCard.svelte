<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import { ICONS } from '$lib/components/system/icons/types';

  interface Props {
    lesson: {
      title: string;
      attempts: number;
    };
  }

  const { lesson }: Props = $props();
  let hovered = $state(false);
  const url = $derived.by(() => {
    return `/levels/${lesson.levelId}/units/${lesson.unitId}/lessons/${lesson.id}`;
  });
</script>

<a
  class="lesson link:reset layout:inline-flex box-rounded:sm"
  href={url}
  aria-label={`View lesson ${lesson.id}`}
  onmouseenter={() => {
    hovered = true;
  }}
  onmouseleave={() => {
    hovered = false;
  }}
>
  <span class="type:lesson-title">{lesson.title}</span>
  <span class="type:label text-color:dark-60">{lesson.attempts} attempts</span>
  <span class="unit-finished">
    <Button
      size="small"
      {hovered}
      icon={hovered ? ICONS.PLAY : ICONS.CHECK}
      iconPosition="after"
      alignment="right"
      variant="primary"
    >
      <span class="text-color:dark-100">Practice</span>
    </Button>
  </span>
</a>

<style lang="scss">
  .lesson {
    height: 72px;
    background-color: var(--color-white-100);
    padding-inline: var(--space-d24);
    --gap: 10px;
    text-decoration: none;
  }

  .unit-finished {
    --btn-fill: #f2f2f6;
    --btn-icon-color: var(--color-dark-100);
    margin-left: auto;
  }
</style>
