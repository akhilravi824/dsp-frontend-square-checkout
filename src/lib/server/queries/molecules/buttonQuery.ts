export const buttonQuery = `
  "button": {
    "_id": button->_id,
    "title": button->title,
    "linkType": button->link.linkType,
    "externalUrl": button->link.externalUrl,
    "internalLinkTitle": button->link.internalLink->title,
    "internalLinkSlug": button->link.internalLink->slug.current,
    "buttonBlurb": button->buttonBlurb,
    "size": button->size,
    "iconType": button->iconType,
    "iconPosition": button->iconPosition,
    "style": button->style
  }
`;
