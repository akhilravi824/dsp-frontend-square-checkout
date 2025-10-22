<script lang="ts">
  import type { IconType } from './types';
  import { svgs } from './icons';

  interface Props {
    type: IconType;
    size?: string;
    color?: string;
  }

  // Cross-browser UUID generation function
  function generateUUID(): string {
    // Try modern crypto.randomUUID() first
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback for older browsers (including iOS Safari < 15.4)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      // Generate UUID v4 using crypto.getRandomValues
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);

      // Set version (4) and variant bits
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      // Convert to hex string with hyphens
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-');
    }

    // Final fallback using Math.random (less secure but works everywhere)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function makeIdsUnique(svgString: string, type: IconType): string {
    const uniqueId = generateUUID().slice(0, 8);
    // Use the icon type as a prefix for uniqueness
    return svgString
      .replace(/id="([^"]+)"/g, `id="${uniqueId}-$1"`)
      .replace(/url\(#([^)]+)\)/g, `url(#${uniqueId}-$1)`);
  }
  
  // Check if content is plain text (emoji), image path, or SVG
  function isPlainText(content: string): boolean {
    return !content.includes('<svg') && !content.startsWith('/');
  }
  
  function isImagePath(content: string): boolean {
    return content.startsWith('/') && (content.includes('.svg') || content.includes('.png') || content.includes('.jpg'));
  }
  const { type }: Props = $props();
</script>

<span class="icon">
  {#if type && svgs[type]}
    {#if isPlainText(svgs[type])}
      {svgs[type]}
    {:else if isImagePath(svgs[type])}
      <img src={svgs[type]} alt="hand gesture" />
    {:else}
      {@html makeIdsUnique(svgs[type], type)}
    {/if}
  {/if}
</span>

<style lang="scss">
  .icon {
    --_color: var(--icon-color, var(--color-dark-100));
    --_size: var(--icon-size, 20px);
    color: var(--_color);
    transition: color 0.3s;

    :global(svg) {
      display: block;
      height: var(--_size);
      width: var(--_size);
    }
  }
</style>
