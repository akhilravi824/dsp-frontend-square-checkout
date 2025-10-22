import type { MediaPlayerElement } from 'vidstack/elements';
import type { SvelteComponent } from 'svelte';
import { isMobile } from '$lib/utils/device.js';

/**
 * Base functionality for video player components
 */
export function createVideoPlayerBase(component: SvelteComponent) {
  const dispatch = component?.['dispatch'] || (() => {});
  let ignoreEvents = false;

  // Debouncing mechanism for events
  let lastEventTimes: Record<string, number> = {};
  const EVENT_DEBOUNCE_MS = 300; // Debounce window in milliseconds

  function shouldDebounceEvent(eventName: string): boolean {
    const now = Date.now();
    const lastTime = lastEventTimes[eventName] || 0;

    if (now - lastTime < EVENT_DEBOUNCE_MS) {
      return true; // Debounce this event
    }

    // Update the timestamp
    lastEventTimes[eventName] = now;
    return false;
  }

  // Track player ready state
  let isPlayerReady = false;
  let pendingOperations: Array<() => void> = [];

  /**
   * Configure common player functionality
   * @param player The media player element
   */
  function setupPlayer(player: MediaPlayerElement | null | undefined) {
    if (!player) return;

    // Add ready state tracking
    player.addEventListener('can-play', () => {
      isPlayerReady = true;

      // Execute any pending operations
      if (pendingOperations.length > 0) {
        pendingOperations.forEach((op) => op());
        pendingOperations = [];
      }
    });

    // Set up event listeners with debouncing
    player.addEventListener('play', () => {
      if (!ignoreEvents && !shouldDebounceEvent('play')) {
        dispatch('play');
      }
    });

    player.addEventListener('pause', () => {
      if (!ignoreEvents && !shouldDebounceEvent('pause')) {
        dispatch('pause');
      }
    });

    player.addEventListener('seeked', () => {
      if (!ignoreEvents && !shouldDebounceEvent('seeked')) {
        dispatch('seeked', { currentTime: player.currentTime });
      }
    });

    // Return cleanup function
    return () => {
      isPlayerReady = false;
      player.removeEventListener('play', () => dispatch('play'));
      player.removeEventListener('pause', () => dispatch('pause'));
      player.removeEventListener('seeked', () => dispatch('seeked'));
      player.removeEventListener('can-play', () => {});
    };
  }

  /**
   * Setup hover controls visibility for the player
   * @param player The media player element
   * @returns A cleanup function to remove event listeners
   */
  function setupHoverControls(player: MediaPlayerElement | null | undefined) {
    if (!player) return () => {};

    let isHovering = false;

    // Find the container element
    const container = player.closest('.video-wrapper');
    if (!container) return () => {};

    // On mobile, always keep controls visible
    const mobile = isMobile();
    if (mobile) {
      player.setAttribute('data-visible', '');
      return () => {}; // No cleanup needed for mobile
    }

    // Setup mouseenter event
    const handleMouseEnter = () => {
      isHovering = true;
      player.setAttribute('data-visible', '');
    };

    // Setup mouseleave event
    const handleMouseLeave = () => {
      isHovering = false;
      player.removeAttribute('data-visible');
      player.dispatchEvent(new CustomEvent('user-inactive'));
    };

    // Add the event listeners
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Return cleanup function
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }

  // Execute operation when player is ready or queue for later
  function whenReady(player: MediaPlayerElement | null | undefined, operation: () => void) {
    if (!player) return;

    if (isPlayerReady) {
      operation();
    } else {
      console.log('Player not ready, queuing operation');
      pendingOperations.push(operation);

      // Attempt to load the player if it exists
      if (player.paused && player.currentTime === 0) {
        try {
          player.preload = 'auto';
          player.load();
        } catch (e) {
          console.warn('Error preloading player:', e);
        }
      }
    }
  }

  // Common player control methods
  const playerControls = {
    /**
     * Plays the video when ready
     */
    playVideo(player: MediaPlayerElement | null | undefined) {
      whenReady(player, () => {
        try {
          player?.play().catch((err) => {
            console.warn('Error playing video:', err);
          });
        } catch (err) {
          console.warn('Exception playing video:', err);
        }
      });
    },

    /**
     * Pauses the video
     */
    pauseVideo(player: MediaPlayerElement | null | undefined) {
      if (player) {
        try {
          player.pause();
        } catch (err) {
          console.warn('Error pausing video:', err);
        }
      }
    },

    /**
     * Seeks the video to a specific time
     */
    seekVideo(player: MediaPlayerElement | null | undefined, time: number) {
      whenReady(player, () => {
        try {
          if (player) player.currentTime = time;
        } catch (err) {
          console.warn('Error seeking video:', err);
        }
      });
    },

    /**
     * Restarts the video from the beginning and plays it
     */
    restart(player: MediaPlayerElement | null | undefined) {
      whenReady(player, () => {
        try {
          if (player) {
            player.currentTime = 0;
            player.play().catch((err) => {
              console.warn('Error playing restarted video:', err);
            });
          }
        } catch (err) {
          console.warn('Error restarting video:', err);
        }
      });
    },

    /**
     * Temporarily ignore events from this player
     */
    setIgnoreEvents(ignore: boolean) {
      ignoreEvents = ignore;

      if (ignore) {
        setTimeout(() => {
          ignoreEvents = false;
        }, 50);
      }
    }
  };

  return { setupPlayer, setupHoverControls, ...playerControls };
}

/**
 * Utility type to get the properties needed to use the base player
 */
export type VideoPlayerBaseProps = {
  playerId?: string;
  aspectRatio?: string;
  loop?: boolean;
  autoplay?: boolean;
};
