import { mediaArrayQuery } from '../molecules/mediaQuery';

export const mediaSliderQuery = `
  _type == "mediaSlider" => {
    ${mediaArrayQuery}
  }
`;
