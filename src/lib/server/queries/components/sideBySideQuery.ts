import { buttonQuery } from '../molecules/buttonQuery';
import { mediaQuery } from '../molecules/mediaQuery';

export const sideBySideQuery = `
  _type == "sideBySide" => {
    _id,
    title,
    composition,
    "copy": copy->{
      _id,
      _createdAt,
      _updatedAt,
      title,
      "copy": copy[] {
        ...,
        _type == "titleIcon" => {
          ...,
          "icon": icon-> {
            title,
            "imageUrl": icon.asset->url
          }
        }
      },
      ${buttonQuery}
    },
    ${mediaQuery},
  }
`;
