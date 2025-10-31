/**
 * PWA Icon Generator
 * Creates simple icons for the PWA manifest
 */

// This is a placeholder - in a real project, you'd want to create actual icon files
// For now, let's create a simple SVG icon and convert it to PNG

const iconSvg = `
<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="24" fill="#1E3A8A"/>
  <text x="96" y="120" font-family="Inter, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white">R</text>
</svg>
`

console.log('PWA Icon SVG:', iconSvg)
console.log('Note: You need to convert this SVG to PNG files for the PWA icons')
console.log('Required sizes: 192x192, 512x512, and maskable versions')

export { iconSvg }







