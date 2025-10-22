export interface HLSInstance {
  index: number;
  hls: any | null;
  supported: boolean | null;
  videoElement: HTMLVideoElement | null;
}

export class HLSManager {
  private instances: Map<number, HLSInstance> = new Map();

  /**
   * Initialize HLS for a video element
   */
  async initializeHLS(videoElement: HTMLVideoElement, src: string, index: number): Promise<boolean> {
    if (!videoElement || this.instances.has(index)) {
      return false;
    }

    // Initialize instance tracking
    const instance: HLSInstance = {
      index,
      hls: null,
      supported: null,
      videoElement
    };

    // Check if HLS is natively supported (Safari)
    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = src;
      instance.supported = true;
      this.instances.set(index, instance);
      return true;
    }

    try {
      // Dynamically import HLS.js to avoid TypeScript issues
      const { default: Hls } = await import('hls.js' as any);

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        instance.hls = hls;
        instance.supported = true;

        hls.loadSource(src);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed for video', index);
        });

        hls.on(Hls.Events.ERROR, (event: any, data: any) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            // Try to recover from fatal errors
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          }
        });

        this.instances.set(index, instance);
        return true;
      } else {
        console.warn('HLS.js is not supported in this browser - will use Media component');
        instance.supported = false;
        this.instances.set(index, instance);
        return false;
      }
    } catch (err) {
      console.error('Failed to load HLS.js:', err);
      instance.supported = false;
      this.instances.set(index, instance);
      return false;
    }
  }

  /**
   * Check if HLS is supported for a given index
   */
  isSupported(index: number): boolean | null {
    return this.instances.get(index)?.supported ?? null;
  }

  /**
   * Get video element for a given index
   */
  getVideoElement(index: number): HTMLVideoElement | null {
    return this.instances.get(index)?.videoElement ?? null;
  }

  /**
   * Play video at given index
   */
  async playVideo(index: number): Promise<void> {
    const instance = this.instances.get(index);
    if (instance?.videoElement) {
      try {
        await instance.videoElement.play();
      } catch (error) {
        console.error('Failed to play video:', error);
      }
    }
  }

  /**
   * Pause video at given index and reset to beginning
   */
  pauseVideo(index: number): void {
    const instance = this.instances.get(index);
    if (instance?.videoElement) {
      instance.videoElement.pause();
      instance.videoElement.currentTime = 0;
    }
  }

  /**
   * Cleanup a specific HLS instance
   */
  cleanupInstance(index: number): void {
    const instance = this.instances.get(index);
    if (instance?.hls && typeof instance.hls.destroy === 'function') {
      instance.hls.destroy();
    }
    this.instances.delete(index);
  }

  /**
   * Cleanup all HLS instances
   */
  cleanupAll(): void {
    this.instances.forEach((instance, index) => {
      if (instance.hls && typeof instance.hls.destroy === 'function') {
        instance.hls.destroy();
      }
    });
    this.instances.clear();
  }

  /**
   * Get all instances (useful for debugging)
   */
  getAllInstances(): Map<number, HLSInstance> {
    return new Map(this.instances);
  }
}
