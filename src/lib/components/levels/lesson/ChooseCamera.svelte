<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import { onMount, createEventDispatcher } from 'svelte';
  import { setCookie, getCookie } from '$lib/utils/cookies';
  import { get } from 'svelte/store';

  // Use internal state instead of exported stores
  let availableCameras = $state<MediaDeviceInfo[]>([]);

  const dispatch = createEventDispatcher();

  type ChooseCameraProps = {
    expandedState?: boolean;
  };

  const { expandedState = false }: ChooseCameraProps = $props();

  let cookieCameraId = getCookie('camera_selected');
  let selectedCameraId = $state('');
  let isPanelOpen = $state(expandedState);
  let isLoading = $state(true);
  let errorMessage = $state('');
  let showComponent = $state(false);

  onMount(async () => {
    selectedCameraId = cookieCameraId || '';
    await refreshCameraList();
  });

  async function refreshCameraList() {
    try {
      isLoading = true;
      errorMessage = '';

      // Request permission to access media devices first
      await navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          // Stop all tracks immediately - we just needed permission
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch((err) => {
          errorMessage = `Camera access denied: ${err.message}`;
          throw err;
        });

      // Get the list of devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === 'videoinput');

      if (cameras.length === 0) {
        errorMessage = 'No camera devices found';
      } else {
        availableCameras = cameras;

        if (availableCameras.length > 1) {
          showComponent = true;
        }

        // First check if cookie camera ID exists and is available
        const cookieCamera = cookieCameraId ? cameras.find((camera) => camera.deviceId === cookieCameraId) : null;

        // If cookie camera found, use it
        if (cookieCamera) {
          selectedCameraId = cookieCamera.deviceId;
        } else {
          // Otherwise fall back to front camera or first camera
          const frontCamera = cameras.find(
            (camera) => camera.label.toLowerCase().includes('front') || camera.label.toLowerCase().includes('face')
          );
          const initialCamera = frontCamera || cameras[0];
          selectedCameraId = initialCamera.deviceId;
        }

        // Notify parent component about the selected camera
        dispatch('camera-selected', { deviceId: selectedCameraId });
      }
    } catch (error: any) {
      errorMessage = `Error accessing cameras: ${error.message}`;
      console.error('Error enumerating cameras:', error);
    } finally {
      isLoading = false;
    }
  }

  function selectCamera(deviceId: string) {
    selectedCameraId = deviceId;
    setCookie('camera_selected', deviceId, { expires: 365, sameSite: 'lax' });
    dispatch('camera-selected', { deviceId });
  }

  function togglePanel() {
    isPanelOpen = !isPanelOpen;
  }

  function handleContinue() {
    dispatch('continue');
  }
</script>

{#if showComponent}
  <div class="camera-selector">
    <button class="toggle-button" onclick={togglePanel}>
      <span class="label">Select Camera </span>
    </button>

    {#if isPanelOpen}
      <div class="selection-panel">
        <div class="panel-header">
          <h3 class="title type:label-large">Select Camera</h3>
        </div>

        <div class="panel-content">
          {#if isLoading}
            <div class="loading">Loading cameras...</div>
          {:else if errorMessage}
            <div class="error">
              <p>{errorMessage}</p>
              <button onclick={refreshCameraList}>Try Again</button>
            </div>
          {:else}
            <ul class="camera-list">
              {#each availableCameras as camera}
                {@const isSelected = selectedCameraId === camera.deviceId}
                <li>
                  <button
                    class="camera-item"
                    onclick={() => selectCamera(camera.deviceId)}
                    aria-label={camera.label}
                    onkeydown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        selectCamera(camera.deviceId);
                      }
                    }}
                    class:selected={isSelected}
                  >
                    <div class="camera-info">
                      <div class="camera-name type:label-large">
                        {camera.label.replace(/\s*\(.*?\)/, '') || `Camera ${camera.deviceId.slice(-4)}`}
                      </div>
                    </div>
                  </button>
                </li>
              {/each}
            </ul>
            <div class="confirm">
              <Button
                icon={ICONS.ARROW_FORWARD}
                alignment="center"
                iconPosition="after"
                onclick={handleContinue}
                noAnimation
              >
                <span>Confirm</span>
              </Button>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  .camera-selector {
    position: absolute;
    bottom: 30px;
    left: 50%;
    z-index: 100;
    transform: translateX(-50%);
  }

  .toggle-button {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: var(--color-white-80, rgba(255, 255, 255, 0.8));
    border: 1px solid var(--color-dark-20, rgba(0, 0, 0, 0.2));
    border-radius: 40px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .selection-panel {
    position: absolute;
    bottom: 0;
    left: 50%;
    margin-top: 8px;
    width: 300px;
    background: var(--color-white, white);
    border-radius: var(--border-radius-md);
    overflow: hidden;
    transform: translateX(-50%);

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 16px;
      text-align: center;

      .title {
        margin: 0;
        width: 100%;
      }
    }

    .panel-content {
      padding: 0 16px 6px 16px;
      max-height: 400px;
      overflow-y: auto;
    }
  }

  .loading,
  .error {
    text-align: center;
    padding: 20px 0;
  }

  .camera-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      justify-content: center;
      margin-bottom: 6px;
    }

    .camera-item {
      display: flex;
      align-items: center;
      padding: 13px 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--color-dark-10);
      background: transparent;
      color: var(--color-dark-100);
      display: block;
      width: 100%;

      &:hover {
        background: var(--color-dark-10);
      }

      &.selected {
        background: var(--color-dark-10);
      }

      .camera-info {
        flex: 1;

        .camera-name {
          text-align: left;
          padding: 0 20px;
        }
      }
    }
  }

  .confirm {
    border-radius: var(--border-radius-lg);
    display: flex;
    justify-content: center;
    --btn-fill: var(--color-dark-100);
  }
</style>
