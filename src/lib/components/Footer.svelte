<script lang="ts">
  import type { Footer, Social } from '../../types/sanity.types';
  const { data }: { data: Footer } = $props();
</script>

{#snippet renderSocials(socials: Social[])}
  <ul class="footer-socials layout:inline-flex">
    {#each socials as social (social._id)}
      {#if social.icon?.asset}
        <li>
          <a href={social.url} target="_blank">
            <img src={(social.icon.asset as unknown as SanityImageAsset).url} alt={social.title} />
          </a>
        </li>
      {/if}
    {/each}
  </ul>
{/snippet}

<footer class="footer">
  <div class="footer-inner layout:max-width">
    <div class="footer-row layout:inline-flex space:d32">
      <div class="link-list layout:stack">
        {#each data.links || [] as link, index (index)}
          <div>
            <p class="type:body"><strong>{link.title}</strong></p>
            <a class="type:body link:underlined" href={link.url}>{link.linkText}</a>
          </div>
        {/each}
      </div>
    </div>

    <div class="footer-row layout:inline-flex space:d16 middle-row">
      {#if data.tagLine}
        <p class="type:body text-color:dark-60 footer-tagline">{@html data.tagLine}</p>
      {/if}
      {@render renderSocials(data.social)}
    </div>

    <div class="footer-row layout:inline-flex">
      {#if data.copyright}
        <p class="type:body text-color:dark-60">{@html data.copyright}</p>
      {/if}
      {#if data.privacyAndTerms}
        <div class="privacy-links">
          {#each data.privacyAndTerms as item, index (index)}
            <a class="type:body link:underlined text-color:dark-60" href={item.url} target="_blank">{item.linkText}</a>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</footer>

<style lang="scss">
  .footer {
    position: relative;
    z-index: 5;
    padding-inline: 16px;

    @media (min-width: 768px) {
      padding-inline: 34px;
    }
  }

  .footer-inner {
    padding-block: 24px;
    border-top: 1.5px solid var(--color-dark-20);
  }

  .link-list {
    --space: var(--space-d16);
    --link-color: var(--color-dark-60);
    --link-hover-color: var(--color-dark-100);
  }

  .footer-row {
    --inline-justify: space-between;
    --inline-align: center;
  }

  .middle-row {
    @media (max-width: 768px) {
      flex-direction: column-reverse;
      align-items: flex-start;
      --gap: 32px;

      p {
        max-inline-size: 230px;
      }
    }
  }

  .footer-socials {
    display: flex;
    gap: 12px;
    --inline-justify: flex-end;
  }

  .footer-tagline {
    :global(a) {
      color: var(--color-dark-100);
      font-weight: var(--font-weight-bold);
    }
  }

  .privacy-links {
    --link-color: var(--color-dark-60);
    --link-hover-color: var(--color-dark-100);
  }
</style>
