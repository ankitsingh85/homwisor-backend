// Allowed image shape + minimum size for each place an image is used.
// ratio = width / height. Keep in sync with homwisor-frontend/src/admin/imageRules.js
export const IMAGE_RULES = {
  hero:     { label: 'Hero banner',      minW: 1400, minH: 450,  ratio: [2.2, 4.0],  ideal: '2100 × 700 px (wide, 3:1)' },
  slider:   { label: 'Image slider',     minW: 1200, minH: 200,  ratio: [4.5, 7.5],  ideal: '1700 × 300 px (very wide strip)' },
  sidead:   { label: 'Side ad',          minW: 300,  minH: 650,  ratio: [0.3, 0.6],  ideal: '720 × 1600 px (tall, 9:20)' },
  property: { label: 'Property photo',   minW: 800,  minH: 450,  ratio: [1.2, 2.2],  ideal: '1600 × 1000 px (landscape)' },
  logo:     { label: 'Logo',             minW: 120,  minH: 40,   ratio: [0.8, 6.0],  ideal: '400 × 160 px' },
  snap:     { label: 'Snap thumbnail',   minW: 400,  minH: 600,  ratio: [0.45, 0.9], ideal: '800 × 1000 px (portrait)' },
  location: { label: 'Location image',   minW: 500,  minH: 350,  ratio: [0.6, 2.0],  ideal: '1000 × 750 px' },
  recommended: { label: 'Recommended card', minW: 500, minH: 450, ratio: [0.7, 1.6], ideal: '1000 × 1000 px (square-ish)' },
  blog:     { label: 'Blog image',       minW: 800,  minH: 400,  ratio: [1.2, 2.4],  ideal: '1600 × 900 px (landscape)' },
  avatar:   { label: 'Customer photo',   minW: 120,  minH: 120,  ratio: [0.7, 1.4],  ideal: '400 × 400 px (square)' },
  offer:    { label: 'Offer image',      minW: 600,  minH: 350,  ratio: [1.1, 2.2],  ideal: '1200 × 800 px (landscape)' },
}

const shape = (r) => r < 0.9 ? 'portrait (tall)' : r > 1.15 ? 'landscape (wide)' : 'square'

// Returns an error message, or null if the image fits the rule
export const imageProblem = (purpose, width, height) => {
  const rule = IMAGE_RULES[purpose]
  if (!rule) return null
  if (!width || !height) return 'Could not read the image size'
  const r = width / height
  const size = `${width} × ${height} px`
  if (r < rule.ratio[0] || r > rule.ratio[1]) {
    return `${rule.label} has the wrong shape: your image is ${size} (${shape(r)}). Use about ${rule.ideal}.`
  }
  if (width < rule.minW || height < rule.minH) {
    return `${rule.label} is too small: your image is ${size}. Use at least ${rule.minW} × ${rule.minH} px — ideally ${rule.ideal}.`
  }
  return null
}
