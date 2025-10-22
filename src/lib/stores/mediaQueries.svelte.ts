const isClient = typeof window !== 'undefined';

const BREAKPOINTS = {
  mobile: '(max-width: 768px)',
  medium: '(min-width: 768px) and (max-width: 1024px)',
  desktop: '(min-width: 1024px)'
};

function createMediaQuery(query: string) {
  let mediaQuery = $state(false);

  if (isClient) {
    const mql = window.matchMedia(query);
    mediaQuery = mql.matches;

    mql.addEventListener('change', (e) => {
      mediaQuery = e.matches;
    });
  }

  return {
    get mediaQuery() {
      return mediaQuery;
    }
  };
}

export const breakpoints = {
  mobile: createMediaQuery(BREAKPOINTS.mobile),
  medium: createMediaQuery(BREAKPOINTS.medium),
  desktop: createMediaQuery(BREAKPOINTS.desktop)
};
