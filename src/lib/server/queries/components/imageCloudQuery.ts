import { buttonQuery } from '../molecules/buttonQuery';
import { mediaArrayQuery } from '../molecules/mediaQuery';
import { largeCtaFields } from './largeCtaQuery';

export const imageCloudQuery = `
  _type == "imageCloud" => {
    title,
    ${mediaArrayQuery},
    "largeCta": largeCta-> ${largeCtaFields}
  }
`;
