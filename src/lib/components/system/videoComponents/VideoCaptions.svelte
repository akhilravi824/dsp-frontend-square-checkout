<media-captions class="vds-captions"></media-captions>

<style>
  media-captions {
    z-index: 10;
    bottom: 0;
    transition: bottom 0.15s linear;
  }

  /* Pull captions up when controls are visible. */
  :global(media-player[data-controls]) media-captions {
    bottom: 80px;
  }

  /* Hide captions when interacting with time slider. */
  :global(media-player[data-preview]) media-captions {
    opacity: 0;
  }

  :global([data-part='cue-display']) {
    --cue-top: 86% !important;
    transition: top 0.15s ease;
  }

  /* Adjust cue-top when controls are visible */
  :global(media-player[data-hocus] [data-part='cue-display']) {
    --cue-top: 77% !important;
  }
</style>
