export const isSafari = () => {
  return (
    navigator.userAgent.includes('Safari') &&
    !navigator.userAgent.includes('Chrome') &&
    !navigator.userAgent.includes('Firefox') &&
    !navigator.userAgent.includes('Samsung')
  );
};

export const isWebView = () => {
  return /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent);
};

export const isPad = () => /Macintosh/i.test(navigator.userAgent) && navigator?.maxTouchPoints > 1;

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export const isOffscreenSupported = () => HTMLCanvasElement.prototype?.transferControlToOffscreen !== undefined;

// export const isMP4Supported = () => MediaRecorder.isTypeSupported('video/mp4');

export const isTouchDevice = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

export const getSupportedMimeType = () => {
  // Check for Safari (which typically uses MP4)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
    '' // Empty string = browser default
  ];

  // For Safari, try MP4 first
  if (isSafari) {
    types.unshift('video/mp4');
  }

  for (const type of types) {
    if (!type) return 'video/webm'; // Default if nothing is supported
    try {
      if (MediaRecorder.isTypeSupported(type)) {
        return type.split(';')[0]; // Return the base MIME type without codecs
      }
    } catch (e) {
      // Ignore errors
    }
  }

  return 'video/webm'; // Default fallback
};
