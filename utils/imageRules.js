// Allowed image shape + minimum size for each place an image is used.
// ratio = width / height. Keep in sync with homwisor-frontend/src/admin/imageRules.js
//
// Photos on the website use object-fit: fill (never cropped), and every frame
// a photo is shown in has the same shape as its rule below (see src/imageFrames.css
// in the frontend) — so a photo that passes this check is never stretched either.
// Shapes with `exact` are checked within ±3%.

const TOLERANCE = 0.03
const exact = (w, h) => { const r = w / h; return [+(r * (1 - TOLERANCE)).toFixed(4), +(r * (1 + TOLERANCE)).toFixed(4)] }

export const IMAGE_RULES = {
  // banners: full-width, shown cropped to fit any screen — a looser shape is fine
  hero:     { label: 'Hero banner',      minW: 1400, minH: 450,  ratio: [2.2, 4.0],    ideal: '2100 × 700 px (wide, 3:1)' },
  slider:   { label: 'Image slider',     minW: 1200, minH: 200,  ratio: [4.5, 7.5],    ideal: '1700 × 300 px (very wide strip)' },
  logo:     { label: 'Logo',             minW: 120,  minH: 40,   ratio: [0.8, 6.0],    ideal: '400 × 160 px' },
  inline:   { label: 'Article image',    minW: 300,  minH: 150,  ratio: [0.3, 4.0],    ideal: '1200 px wide (any shape)' },

  // photos shown with object-fit: fill — exact shapes
  property: { label: 'Property photo',   minW: 1200, minH: 800,  ratio: exact(3, 2),   shapeName: '3:2',  ideal: '1800 × 1200 px' },
  offer:    { label: 'Offer image',      minW: 900,  minH: 600,  ratio: exact(3, 2),   shapeName: '3:2',  ideal: '1200 × 800 px' },
  blog:     { label: 'Blog cover',       minW: 1280, minH: 720,  ratio: exact(16, 9),  shapeName: '16:9', ideal: '1600 × 900 px' },
  location: { label: 'Location image',   minW: 600,  minH: 600,  ratio: exact(1, 1),   shapeName: '1:1 (square)', ideal: '1000 × 1000 px' },
  recommended: { label: 'Recommended card', minW: 600, minH: 600, ratio: exact(1, 1), shapeName: '1:1 (square)', ideal: '1000 × 1000 px' },
  avatar:   { label: 'Customer photo',   minW: 200,  minH: 200,  ratio: exact(1, 1),   shapeName: '1:1 (square)', ideal: '400 × 400 px' },
  sidead:   { label: 'Side ad',          minW: 450,  minH: 1000, ratio: exact(9, 20),  shapeName: '9:20 (tall)', ideal: '720 × 1600 px' },
  snap:     { label: 'Snap thumbnail',   minW: 540,  minH: 960,  ratio: exact(9, 16),  shapeName: '9:16 (tall)', ideal: '1080 × 1920 px' },
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
    return rule.shapeName
      ? `${rule.label} must be ${rule.shapeName} — your image is ${size}. Crop it to ${rule.shapeName} (for example ${rule.ideal}) so it fits without stretching.`
      : `${rule.label} has the wrong shape: your image is ${size} (${shape(r)}). Use about ${rule.ideal}.`
  }
  if (width < rule.minW || height < rule.minH) {
    return `${rule.label} is too small: your image is ${size}. Use at least ${rule.minW} × ${rule.minH} px — ideally ${rule.ideal}.`
  }
  return null
}
