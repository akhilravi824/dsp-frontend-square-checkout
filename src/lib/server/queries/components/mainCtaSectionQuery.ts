import { buttonQuery } from '../molecules/buttonQuery';
import { mediaQuery } from '../molecules/mediaQuery';

export const mainCtaSectionQuery = `
  _type == "mainCtaSection" => {
    ${buttonQuery},
    ${mediaQuery}
  }
`;
