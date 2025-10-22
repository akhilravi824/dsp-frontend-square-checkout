<script lang="ts">
  import { toHTML } from '@portabletext/to-html';

  const { copy, class: className = '', bodyTypeClass = 'type:body' } = $props();

  // Function to parse text and handle links
  function parseLinksInText(text: string): string {
    // Regular expression to match links in HTML format
    const linkRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>(.*?)<\/a>/gi;

    return text.replace(linkRegex, (match, beforeHref, href, afterHref, linkText) => {
      // Check if it's an external link (starts with https://)
      if (href.startsWith('https://')) {
        // Add target="_blank" and rel="noopener noreferrer" for security
        return `<a ${beforeHref}href="${href}" target="_blank" rel="noopener noreferrer"${afterHref}>${linkText}</a>`;
      }
      // Check if it's an internal link (starts with /)
      else if (href.startsWith('/')) {
        // Keep as is for internal links
        return `<a ${beforeHref}href="${href}"${afterHref}>${linkText}</a>`;
      }
      // For other links, keep them as is
      else {
        return match;
      }
    });
  }

  // Function to process HTML content and handle links
  function processHtmlContent(htmlContent: string): string {
    return parseLinksInText(htmlContent);
  }
</script>

<div class="rich-text {className}">
  {#if Array.isArray(copy) && copy.length > 1}
    {#each copy as block}
      {#if block._type === 'titleIcon'}
        <div class="title-icon">
          <span class="icon-wrapper">
            <img src={block.icon.imageUrl} alt={block.icon.title} width="20" height="20" />
          </span>
          <h3 class="type:body-large-medium space:d6 text-color:dark-100">{block.title}</h3>
        </div>
      {:else if block._type === 'block' && block.style === 'h3'}
        <h3 class="type:body-large-medium space:d6 text-color:dark-100">
          {#each block.children as child}
            {@html processHtmlContent(child.text)}
          {/each}
        </h3>
      {:else if block._type === 'block'}
        <p class="text-block {bodyTypeClass} text-color:dark-60 space:d36">
          {#each block.children as child}
            {#if child._type === 'span'}
              {@html processHtmlContent(child.text)}
            {/if}
          {/each}
        </p>
      {/if}
    {/each}
  {:else}
    <div class="rich-text-copy {bodyTypeClass}">
      {@html processHtmlContent(toHTML(copy))}
    </div>
  {/if}
</div>

<style lang="scss">
  .title-icon {
    display: flex;

    &:nth-child(1) {
      padding-block-start: var(--space-d24);
    }

    .icon-wrapper {
      margin-right: 12px;
    }
  }

  .text-block {
    &:last-child {
      margin-block-end: 0;
    }
  }

  .rich-text-copy {
    color: var(--rich-text-copy-color, var(--color-dark-60));
  }
</style>
