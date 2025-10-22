import { buttonQuery } from '../molecules/buttonQuery';
import { mediaQuery } from '../molecules/mediaQuery';

export const largeCtaFields = `{
  _id,
  title,
  "media": ${mediaQuery},
  ${buttonQuery}
}`;

export const largeCtaQuery = `
  _type == "largeCta" => ${largeCtaFields}
`;
