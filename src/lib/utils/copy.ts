export function replaceDynamicContent(text: string | any[], key: string, value: string) {
  if (!text) {
    return '';
  }

  // Handle rich text objects from Sanity
  if (Array.isArray(text)) {
    return text.map((block) => {
      if (block._type === 'block' && block.children) {
        return {
          ...block,
          children: block.children.map((child: any) => {
            if (child._type === 'span' && child.text) {
              return {
                ...child,
                text: child.text.replace(`{{${key}}}`, value)
              };
            }
            return child;
          })
        };
      }
      return block;
    });
  }

  // Handle regular strings
  return text.replace(`{{${key}}}`, value);
}

export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
