<script lang="ts">
  import { page } from '$app/stores';
  const { children } = $props<{ children: any }>();
</script>

{#key $page.params.lessonId}
  <div class="lesson-layout">
    {@render children()}
  </div>
{/key}
