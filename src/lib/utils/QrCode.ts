export function QrCodeTransformer(svgCode: string) {
  if (!svgCode) return null;
  svgCode = svgCode.replace(/fill:white/g, 'fill:#F2F3F6');
  svgCode = svgCode.replace(/fill="#FFFFFF"/g, 'fill="#F2F3F6"');
  svgCode = svgCode.replace(/fill="#ffffff"/g, 'fill="#F2F3F6"');
  svgCode = svgCode.replace(/fill="white"/g, 'fill="#F2F3F6"');
  svgCode = svgCode.replace(/fill:rgb\(255,\s*255,\s*255\)/g, 'fill:#F2F3F6');

  // Check if SVG is complete
  if (!svgCode.includes('</svg>')) {
    // Try to fix incomplete style attributes
    svgCode = svgCode.replace(/style="([^"]*)$/g, 'style="$1" />');

    // Add closing SVG tag if missing
    svgCode += '\n</svg>';
  }

  // Fix incomplete rectangle tags
  svgCode = svgCode.replace(/<rect ([^>]*)style="([^"]*)"(?!\s*\/>)/g, '<rect $1style="$2" />');
  return svgCode;
}
