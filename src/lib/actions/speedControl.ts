// src/lib/actions/speedControl.ts
type SpeedOpts = {
  speeds?: number[];
  defaultRate?: number;
  position?: { top?: string; right?: string; bottom?: string; left?: string };
};

export function speedControl(node: HTMLElement, opts: SpeedOpts = {}) {
  const {
    speeds = [0.5, 1, 1.5, 2],
    defaultRate = 1,
    position = { top: '10px', right: '10px' }
  } = opts;

  // Treat node as Vidstack <media-player>
  const player = node as any;

  // Build dropdown
  const select = document.createElement('select');
  select.className = 'dsp-speed-control';
  for (const s of speeds) {
    const opt = document.createElement('option');
    opt.value = String(s);
    opt.textContent = `${s}x`;
    if (s === defaultRate) opt.selected = true;
    select.appendChild(opt);
  }

  // Style
  Object.assign(select.style, {
    position: 'absolute',
    zIndex: '9999',
    padding: '4px 6px',
    fontSize: '14px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(0,0,0,0.1)',
    ...(position as Record<string, string>)
  });

  // Ensure positioned container
  const wrapper = node.parentElement ?? node;
  if (getComputedStyle(wrapper).position === 'static') {
    wrapper.style.position = 'relative';
  }
  wrapper.appendChild(select);

  // Apply initial rate
  try {
    player.playbackRate = defaultRate;
  } catch {}

  const onChange = () => {
    const rate = parseFloat(select.value);
    try {
      player.playbackRate = rate;
    } catch (e) {
      console.warn('Could not set playbackRate on media-player', e);
    }
  };
  select.addEventListener('change', onChange);

  return {
    destroy() {
      select.removeEventListener('change', onChange);
      select.remove();
    }
  };
}
