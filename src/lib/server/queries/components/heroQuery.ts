import { buttonQuery } from '../molecules/buttonQuery';

export const heroQuery = `
  _type == "hero" => { 
    ${buttonQuery},
  }
`;
