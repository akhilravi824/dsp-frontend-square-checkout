<script>
  // Define props
  /** @type {any} */
  export let footer;
  //console.log('Footer props:', footer);
</script>

<footer class="site-footer">
  {#if footer}
    <div class="container">
      <div class="footer-content">
        <div class="footer-branding">
          <h2>{footer.title || 'Dawn Sign Press'}</h2>
          {#if footer.tagLine}
            <p class="tagline">{footer.tagLine}</p>
          {/if}
        </div>

        {#if footer.links && footer.links.length > 0}
          <nav class="footer-nav">
            <ul>
              {#each footer.links as link}
                <li>
                  <a href={link.url}>{link.title}</a>
                </li>
              {/each}
            </ul>
          </nav>
        {/if}

        {#if footer.social && footer.social.length > 0}
          <div class="social-links">
            {#each footer.social as social}
              <a href={social.url} title={social.title} target="_blank" rel="noopener noreferrer">
                {#if social.icon && social.icon.asset}
                  <img src={social.icon.asset.url} alt={social.title} width="24" height="24" />
                {:else}
                  {social.title}
                {/if}
              </a>
            {/each}
          </div>
        {/if}

        {#if footer.copyright}
          <div class="copyright">
            {footer.copyright}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</footer>
