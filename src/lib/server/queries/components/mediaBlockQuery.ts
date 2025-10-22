import { mediaSpreadQuery } from '../molecules/mediaQuery';

export const mediaBlockQuery = `
  _type == "mediaBlock" => {
    mediaBlock->{
      _id,
      title,
      mediaType,
      ${mediaSpreadQuery}
    }
  }
`;
