<script>
  import { ROUTES } from '$lib/routes.js';
  import { ICONS } from '$lib/components/system/icons/types.js';
  import { toHTML } from '@portabletext/to-html';
  import Button from '$lib/components/system/Button.svelte';

  const { data, className = '' } = $props();

</script>

<div class="get-starter-for-free-cta {className}">
  <Button hovered href={ROUTES.SIGN_UP} icon={ICONS.ARROW_FORWARD}>{data.button.title}</Button>
  <p class="choose-your-plan type:body">{@html toHTML(data.button.buttonBlurb)}</p>
</div>

<style lang="scss">
  .get-starter-for-free-cta {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    flex-direction: column;

    @media screen and (min-width: 768px) {
      flex-direction: row;
    }
  }

  .choose-your-plan {
    color: var(--color-dark-60);
    max-inline-size: 170px;
    text-align: center;

    @media screen and (min-width: 768px) {
      text-align: left;
    }

    :global(a) {
      color: currentColor;
      text-decoration: underline;
      transition: color 0.2s ease;

      &:hover {
        color: var(--color-dark-100);
      }
    }
  }
</style>
