<script>
  // Define props
  /** @type {any} */
  export let header;
  //console.log('Header props:', header);

  // Helper function to get the correct link URL
  function getButtonUrl(button) {
    if (!button.link) return '/';

    if (button.link.linkType === 'internal' && button.link.internalLink?.slug) {
      return `/${button.link.internalLink.slug === 'home' ? '' : button.link.internalLink.slug}`;
    } else if (button.link.linkType === 'external' && button.link.externalUrl) {
      return button.link.externalUrl;
    } else if (typeof button.link === 'string') {
      return button.link;
    }

    return '/';
  }

  // Helper function to format button blurb content if it exists
  function formatButtonBlurb(blurb) {
    if (!blurb || !Array.isArray(blurb) || !blurb.length) return '';

    // For simple text extraction from Portable Text
    let text = '';
    blurb.forEach((block) => {
      if (block._type === 'block' && block.children) {
        block.children.forEach((child) => {
          if (child._type === 'span') {
            text += child.text;
          }
        });
      }
    });

    return text;
  }
</script>

<header class="site-header">
  {#if header && header.title}
    <div class="container">
      <div class="header-content">
        <a href="/" class="logo">
          <h1>{header.title}</h1>
        </a>

        <nav class="main-nav">
          {#if header.buttons && header.buttons.length > 0}
            <ul>
              {#each header.buttons as button}
                <li>
                  <a
                    href={getButtonUrl(button)}
                    class="btn {button.style || 'primary'} {button.size || 'default'}"
                    data-blurb={formatButtonBlurb(button.buttonBlurb)}
                    target={button.link?.linkType === 'external' ? '_blank' : undefined}
                    rel={button.link?.linkType === 'external' ? 'noopener noreferrer' : undefined}
                  >
                    {#if button.iconType && button.iconPosition === 'left'}
                      <span class="icon icon-{button.iconType}"></span>
                    {/if}

                    {button.title}

                    {#if button.iconType && button.iconPosition === 'right'}
                      <span class="icon icon-{button.iconType}"></span>
                    {/if}
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        </nav>
      </div>
    </div>
  {/if}
</header>

<style>
  .site-header {
    position: relative;
    z-index: 100;
    padding: 1rem 0;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    text-decoration: none;
    color: inherit;
  }

  .main-nav ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 1rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn.primary {
    background-color: var(--primary-color, #0066cc);
    color: white;
  }

  .btn.secondary {
    background-color: transparent;
    border: 1px solid var(--primary-color, #0066cc);
    color: var(--primary-color, #0066cc);
  }
</style>
