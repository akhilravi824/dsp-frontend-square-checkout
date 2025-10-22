import { mediaQuery } from '../molecules/mediaQuery';

export const faqQuery = `
  _type == "faq" => {
    "items": items[]{
      _key,
      question,
      answer
    }
  }
`;
