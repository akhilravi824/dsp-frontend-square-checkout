import { mediaQuery } from '../molecules/mediaQuery';

export const introQuery = `
  _type == "intro" => {
    ${mediaQuery},
    quickFacts->{
      _id,
      title,
      "facts": facts[]{
          "icon": {
            ...icon,
            "url": icon.asset->url,
            "metadata": icon.asset->metadata
          },
          title
        }
      }
  }
`;
