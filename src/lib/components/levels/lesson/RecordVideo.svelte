<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { getCookie, setCookie } from '$lib/utils/cookies';
  import Button from '$lib/components/system/Button.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import ChooseCamera from './ChooseCamera.svelte';
  import NoCameraWarning from './NoCameraWarning.svelte';
  import CountDown from './CountDown.svelte';
  import { currentStepId } from '$lib/stores/lessonStore';
  import VideoRecordPlayer from '$lib/components/system/VideoRecordPlayer.svelte';
  import { getSupportedMimeType } from '$lib/utils/device';
  import Spinner from '$lib/components/system/Spinner.svelte';
  import { progressApi } from '$lib/api';
  import Icon from '$lib/components/system/icons/Icon.svelte';

  // Initialize the event dispatcher with additional event types
  const dispatch = createEventDispatcher<{
    continue: void; // Event with no payload
    syncInstructionVideo: { action: string; time?: number }; // Event to sync instruction video
    syncRecordingVideo: { action: string; time?: number }; // Event to receive sync commands from outside
  }>();

  let preview = $state<HTMLVideoElement>();
  let mediaRecorder: MediaRecorder;
  let recordedChunks: BlobPart[] = [];
  let mounted = $state(false);
  let isCountingDown = $state(false);
  let isRecording = $state(false);
  let initRecording = $state(false);
  let cameraAvailable = $state(false);
  let cameraChecked = $state(false);
  let errorMessage = $state('');
  let selectedCameraId = $state<string | null>(null);
  let isTransitioning = $state(false);
  // Add a cancellation flag
  let wasCancelled = $state(false);

  let recordDiv: HTMLElement;
  let innerDiv: HTMLElement;
  let resizeObserver: ResizeObserver;

  const {
    duration = 7,
    initialStep = 0,
    contentDiv = null
  } = $props<{
    duration?: number;
    initialStep?: number;
    contentDiv?: HTMLElement | null;
  }>();

  // Add a reference to the countdown component
  let countdownComponent = $state<any>();

  // Add state variables for progress tracking
  let recordingProgress = $state(0);
  let recordingTimer = $state<ReturnType<typeof setTimeout> | null>(null);
  let progressInterval = $state<ReturnType<typeof setInterval> | null>(null);

  // Add new state variables for review mode
  let isReviewing = $state(false);
  let blob: Blob = $state(null);
  let recordedVideoUrl = $state<string | null>(null);
  let reviewVideo: HTMLVideoElement;
  let instructionsInit: boolean = $currentStepId === 'camera';
  let cookieCameraId: string = getCookie('camera_selected') || '';

  // Add state variable for detected video type
  let recordedVideoType = $state('video/webm'); // Default, will be updated

  let recordedVideoPlayer = $state<VideoRecordPlayer>();

  // Add tracking for sidebar transitions
  let sidebarTransitionRAF: number | null = null;

  // Optimized resize function
  function resizeVideoContainer() {
    if (!recordDiv || !innerDiv || !contentDiv) return;

    if (instructionsInit && ($currentStepId === 'camera' || $currentStepId === 'position')) {
      // Now use the passed reference instead of querySelector
      // Calculate dimensions
      const parentWidth = contentDiv.getBoundingClientRect().width;
      const parentHeight = contentDiv.getBoundingClientRect().height;

      // Determine dimensions based on step
      const newWidth = (parentWidth - 18) / 2;
      const width = $currentStepId === 'camera' ? parentWidth - 12 : newWidth;
      const height = $currentStepId === 'camera' ? parentHeight : newWidth * 0.75;

      // Apply styles
      recordDiv.style.width = `${width}px`;
      recordDiv.style.height = `${height}px`;
    } else {
      recordDiv.removeAttribute('style');
    }
  }

  // Track sidebar transitions
  function observeSidebarTransitions() {
    // Find the sidebar element in the parent
    const sidebarElement = document.querySelector('.sidebar-holder');
    if (!sidebarElement) return;

    // Create a MutationObserver to detect class changes on sidebar
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          const hasOpenClass = target.classList.contains('open');

          // Start tracking when sidebar class changes
          if (sidebarTransitionRAF) {
            cancelAnimationFrame(sidebarTransitionRAF);
            sidebarTransitionRAF = null;
          }

          // Start animation loop to update container during transition
          function animateResize() {
            resizeVideoContainer();
            sidebarTransitionRAF = requestAnimationFrame(animateResize);
          }

          sidebarTransitionRAF = requestAnimationFrame(animateResize);

          // Stop the animation loop after transition completes
          setTimeout(() => {
            if (sidebarTransitionRAF) {
              cancelAnimationFrame(sidebarTransitionRAF);
              sidebarTransitionRAF = null;
              // One final resize after transition completes
              resizeVideoContainer();
            }
          }, 400); // Match the transition duration from CSS
        }
      });
    });

    observer.observe(sidebarElement, { attributes: true });

    return observer;
  }

  // Function to handle step changes with transition
  function handleStepChange() {
    if (!recordDiv && !mounted) return;
    // Enable transition
    isTransitioning = true;
    recordDiv.style.transition =
      'width 0.5s cubic-bezier(0.22, 1, 0.36, 1), height 0.5s cubic-bezier(0.22, 1, 0.36, 1)';

    // Apply new dimensions
    resizeVideoContainer();

    // Remove transition after animation completes
    setTimeout(() => {
      recordDiv.style.transition = 'none';
      isTransitioning = false;
    }, 350); // slightly longer than the transition duration
  }

  // React to currentStep changes - use handleStepChange for transitions
  $effect(() => {
    if (recordDiv && innerDiv && instructionsInit && ($currentStepId === 'camera' || $currentStepId === 'position')) {
      handleStepChange();
    }

    if ($currentStepId === 'ready' && isReviewing) {
      isReviewing = false;
      startCamera();
    }

    resizeVideoContainer();
  });

  // Listen for changes to the selected camera
  $effect(() => {
    if ($currentStepId === 'ready' && selectedCameraId && cameraChecked && cameraAvailable) {
      startCamera();
    }
  });

  onMount(() => {
    // Use regular resize function without transitions for window resize
    window.addEventListener('resize', resizeVideoContainer);

    instructionsInit = $currentStepId === 'camera' ? true : false;

    // Create and setup ResizeObserver to watch recordDiv size changes
    if (recordDiv) {
      resizeObserver = new ResizeObserver(() => {
        // Only resize without transition if not in the middle of a step transition
        if (!isTransitioning) {
          resizeVideoContainer();
        }
      });
      resizeObserver.observe(recordDiv);
    }

    // Initialize camera access
    checkCameraAccess();

    // Initial size adjustment
    setTimeout(resizeVideoContainer, 0);

    // Wait for camera check to pass
    setTimeout(() => {
      mounted = true;
    }, 1500);

    // Initialize sidebar transition observer
    const sidebarObserver = observeSidebarTransitions();

    return () => {
      if (sidebarObserver) {
        sidebarObserver.disconnect();
      }
      if (sidebarTransitionRAF) {
        cancelAnimationFrame(sidebarTransitionRAF);
      }
    };
  });

  onDestroy(() => {
    window.removeEventListener('resize', resizeVideoContainer);

    if (resizeObserver && recordDiv) {
      resizeObserver.unobserve(recordDiv);
      resizeObserver.disconnect();
    }

    // Stop video if recording is active
    if (isRecording && mediaRecorder) {
      try {
        stopRecording();
      } catch (err) {
        console.error('Error stopping recording on destroy:', err);
      }
    }

    // Clear timers
    if (progressInterval) clearInterval(progressInterval);
    if (recordingTimer) clearTimeout(recordingTimer);

    // Clean up any object URLs
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }

    // Clean up any remaining animation frame
    if (sidebarTransitionRAF) {
      cancelAnimationFrame(sidebarTransitionRAF);
      sidebarTransitionRAF = null;
    }
  });

  async function checkCameraAccess() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support accessing the camera');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraAvailable = true;
      stream.getTracks().forEach((track) => track.stop());
    } catch (err: any) {
      cameraAvailable = false;

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera access was denied. Please grant permission to use your camera.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera detected. Please connect a camera and refresh the page.';
      } else {
        errorMessage = `Cannot access camera: ${err.message}`;
      }
    } finally {
      cameraChecked = true;
      if (cameraAvailable) {
        startCamera();
      }
    }
  }

  // New function to start camera without recording
  async function startCamera() {
    try {
      // First check for cookie, then selected camera, then default
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === 'videoinput');

      // Check if cookie camera actually exists in available devices
      const cookieCameraAvailable = cameras.some((device) => device.deviceId === cookieCameraId);

      // Pick a deviceId to use, with proper fallback
      let deviceIdToUse = null;

      if (cookieCameraId && cookieCameraAvailable) {
        deviceIdToUse = cookieCameraId;
      } else if (selectedCameraId) {
        deviceIdToUse = selectedCameraId;
      } else if (cameras.length > 0) {
        deviceIdToUse = cameras[0].deviceId;
        selectedCameraId = deviceIdToUse; // Update selection
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: deviceIdToUse ? { deviceId: { ideal: deviceIdToUse } } : true,
          audio: false
        });
      } catch (err) {
        // If ideal fails, fall back to any camera
        console.log('Falling back to any available camera');
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      if (preview) {
        preview.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Error starting camera:', err);
      errorMessage = `Error starting camera: ${err.message}`;
    }
  }

  async function startRecording() {
    initRecording = true;
    isReviewing = false;
    wasCancelled = false; // Reset cancellation flag when starting recording
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      recordedVideoUrl = null;
    }

    try {
      recordingProgress = 0;

      const videoConstraints = selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      if (!preview) return;

      preview.srcObject = stream;
      recordedChunks = [];

      const mimeType = getSupportedMimeType();
      recordedVideoType = mimeType;
      mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        blob = new Blob(recordedChunks, { type: recordedVideoType });

        // Only enter review mode if the recording wasn't cancelled
        if (!wasCancelled) {
          // Create a URL for the recorded video and enter review mode
          recordedVideoUrl = URL.createObjectURL(blob);
          isReviewing = true;
        }
      };

      mediaRecorder.start();
      isRecording = true;

      // Make sure the restart instruction is sent immediately
      // Adding console.log for debugging
      console.log('Dispatching restart event to instruction video');
      dispatch('syncInstructionVideo', {
        action: 'restart',
        source: 'recording'
      });

      // Set up progress tracking and auto-stop
      const durationMs = duration * 1000; // Convert seconds to milliseconds
      const updateInterval = 50; // Update progress every 50ms for smooth animation
      const steps = durationMs / updateInterval;

      // Start progress interval
      progressInterval = setInterval(() => {
        recordingProgress += 100 / steps;
        if (recordingProgress >= 100) {
          recordingProgress = 100;
        }
      }, updateInterval);

      // Set timer to stop recording after duration
      recordingTimer = setTimeout(() => {
        stopRecording();
      }, durationMs);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      initRecording = false;
      errorMessage = `Error starting recording: ${err.message}`;
    }
  }

  function stopRecording() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    if (recordingTimer) {
      clearTimeout(recordingTimer);
      recordingTimer = null;
    }

    if (!mediaRecorder || mediaRecorder.state === 'inactive') return;

    // Call recordingCompleted ONLY if this wasn't a cancellation
    if (!wasCancelled) {
      recordingCompleted();
    }

    mediaRecorder.stop();
    if (preview?.srcObject) {
      const tracks = preview.srcObject as MediaStream;
      tracks.getTracks().forEach((track) => track.stop());
    }
    isRecording = false;
    initRecording = false;
  }

  function recordingCompleted() {
    dispatch('continue');
    // Add any additional completion logic here
  }

  function handleCameraSelected(event: CustomEvent) {
    const { deviceId } = event.detail;
    selectedCameraId = deviceId;
    cookieCameraId = getCookie('camera_selected') || '';

    // Immediately start the camera with the new deviceId
    if (cameraChecked && cameraAvailable) {
      startCamera();
    }
  }

  async function retryAccess() {
    cameraChecked = false;
    errorMessage = '';
    await checkCameraAccess();
  }

  function startCountDown() {
    isCountingDown = true;
  }

  async function handleCancel() {
    if (isRecording) {
      wasCancelled = true;
      await stopRecording();
    }
    isReviewing = false;
    await startCamera();
  }

  function handleContinue() {
    dispatch('continue');
  }

  function handleCountDownComplete() {
    startRecording();
    isCountingDown = false;
  }

  export async function uploadSubmit() {
    console.log('Uploading video...');
    try {
      // Ensure we have a blob to upload
      if (!blob) {
        console.error('No video recorded');
        return { success: false, error: 'No video recorded' };
      }

      // Call the API and receive the structured response
      const response = await progressApi.uploadVideo(blob);
      console.log('Upload complete with result:', response);
      return response;
    } catch (error) {
      console.error('Error uploading video:', error);
      // Return a structured error response
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during upload'
      };
    }
  }

  // Method to handle sync events from parent component
  export function handleSyncEvent(detail: { action: string; time?: number; source?: string }) {
    if (!recordedVideoPlayer || !isReviewing) return;

    // Don't react to our own events
    if (detail.source === 'recording') return;

    switch (detail.action) {
      case 'play':
        recordedVideoPlayer.playVideo();
        break;
      case 'pause':
        recordedVideoPlayer.pauseVideo();
        break;
      case 'seek':
        if (typeof detail.time === 'number') {
          recordedVideoPlayer.seekVideo(detail.time);
        }
        break;
      case 'restart':
        recordedVideoPlayer.restart();
        break;
    }
  }

  // Handle play/pause events from the video players
  function handleVideoEvent(event: string, data?: any) {
    // Format data correctly for different input types
    const eventData = {
      action: event,
      time: typeof data === 'object' ? data?.currentTime : data,
      source: 'recording' // Add source to identify where the event came from
    };

    dispatch('syncInstructionVideo', eventData);
  }
</script>

<div class="record-video" bind:this={recordDiv}>
  <Spinner color={'var(--color)'} center="true"></Spinner>
  <div class="record-video--inner" bind:this={innerDiv} class:reveal={mounted}>
    {#if cameraChecked && cameraAvailable && isReviewing && recordedVideoUrl}
      <VideoRecordPlayer
        bind:this={recordedVideoPlayer}
        src={recordedVideoUrl}
        blobUrl={true}
        type={recordedVideoType}
        autoplay={true}
        loop={true}
        {duration}
        playerId="record-player"
        on:play={() => handleVideoEvent('play')}
        on:pause={() => handleVideoEvent('pause')}
        on:seeked={(e) => handleVideoEvent('seek', e.detail)}
      />
    {:else if cameraChecked && cameraAvailable}
      <div class="video-wrapper">
        <video class="live" bind:this={preview} autoplay muted playsinline></video>
      </div>
    {:else}
      <NoCameraWarning error={cameraChecked} errorMessage={cameraChecked ? errorMessage : ''} on:retry={retryAccess} />
    {/if}

    {#if isCountingDown}
      <CountDown bind:this={countdownComponent} on:completed={handleCountDownComplete} />
    {/if}

    {#if cameraChecked && cameraAvailable && $currentStepId === 'camera' && !isReviewing}
      <div class="choose-camera">
        <ChooseCamera on:camera-selected={handleCameraSelected} expandedState={true} on:continue={handleContinue} />
      </div>
    {/if}
    {#if isRecording || initRecording}
      <div class="controls controls-recording">
        <div class="recording-label type:label-large">
          <div class="circle-progress" style="--p: {recordingProgress};"></div>
          <span>Recording...</span>
        </div>
        <button class="btn-cancel type:label-large" onclick={handleCancel} type="button">
          <span>Cancel</span><Icon type={ICONS.CLOSE} />
        </button>
      </div>
    {:else if cameraChecked && cameraAvailable && ($currentStepId === 'camera' || $currentStepId === 'position' || $currentStepId === 'instructor')}
      <div class="controls controls-main">
        <div class="control-next">
          {#key $currentStepId}
            <Button icon={ICONS.ARROW_FORWARD} alignment="center" iconPosition="after" onclick={handleContinue}>
              {#if $currentStepId === 'position'}
                <span>I can see myself</span>
              {:else if $currentStepId === 'instructor'}
                <span>I’m ready</span>
              {:else}
                <span>Next</span>
              {/if}
            </Button>
          {/key}
        </div>
      </div>
    {:else if cameraChecked && cameraAvailable && $currentStepId === 'ready' && !isRecording && !isCountingDown}
      <div class="controls controls-main">
        <div class="control-record">
          <Button icon={ICONS.RECORD} iconPosition="before" onclick={startCountDown}>
            <span>Record sign</span>
          </Button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .record-video {
    padding: 2rem;
    position: absolute;
    bottom: 0;
    right: 0;
    height: auto;
    width: calc(50% - 3px);
    aspect-ratio: 4/3;
    background: var(--color-dark-5);
    border-radius: var(--border-radius-lg);
    will-change: width, height;
    overflow: hidden;

    &--inner {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: absolute;
      width: 100%;
      height: 100%;
      bottom: 0;
      right: 0;
      overflow: hidden;
      will-change: width, height;
      opacity: 0;
      transition: all 0.3s ease-out;
      transition-delay: 0.5s;

      &.reveal {
        opacity: 1;
      }
    }
  }

  video {
    width: 100%;
    border-radius: var(--border-radius-lg);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;

    &.live {
      -webkit-transform: scaleX(-1);
      transform: scaleX(-1);
    }
  }

  button {
    color: white;
    border: none;
  }

  .controls {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    padding: 32px;
    left: 0;
    align-items: center;
    --btn-fill: var(--color-white-100);

    &.controls-main {
      flex-direction: column;
      justify-content: center;
      color: var(--color-dark-100);
      --icon-color: var(--color-dark-100);

      .control-record {
        align-self: flex-start;
      }

      .control-next {
        align-self: center;
      }
    }

    &.controls-recording {
      color: var(--color-white-100);
      --icon-color: var(--color-white-100);
      justify-content: space-between;
      padding-left: 54px;

      .recording-label {
        display: flex;
      }

      .circle-progress {
        width: 20px;
        height: 20px;
        margin-right: 6px;
        border-radius: 50%;
        background: conic-gradient(
          var(--color-white-100) 0% calc(var(--p, 0) * 1%),
          transparent calc(var(--p, 0) * 1%) 100%
        );
        border: 2px solid var(--color-white-100);
      }

      .btn-cancel {
        background: var(--color-dark-10);
        backdrop-filter: blur(14px);
        border-radius: var(--btn-radius, 24px);
        display: flex;
        color: var(--color-white-60);
        cursor: pointer;
        align-items: center;
        height: 48px;
        width: 120px;
        justify-content: center;
        --icon-color: var(--color-white-60);

        span {
          margin-right: 6px;
        }

        &:hover {
          color: var(--color-white-100);
          --icon-color: var(--color-white-100);
        }
      }
    }
  }

  :global(.record-video .controls.controls-main .button) {
    color: var(--color-dark-100);
    --icon-color: var(--color-dark-100);
  }
</style>
