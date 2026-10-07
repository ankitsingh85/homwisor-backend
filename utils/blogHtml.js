// Blog article bodies are rich-text HTML written in the admin editor (Quill).
// They're shown on the public site as HTML, so every save is cleaned here:
// only formatting tags survive — no scripts, styles, event handlers or forms.
//
// sanitize-html is pinned to 2.17.5: newer versions need an ESM-only parser that
// require() can't load on Node < 20.19 / 22.12. The two advisories open against
// 2.17.5 need `textarea`/`xmp` or SVG tags to be allowed — never allow those here.
import sanitizeHtml from 'sanitize-html'
import Blog from '../models/Blog.js'

const VIDEO_HOSTS = ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com']

export const cleanBlogHtml = (html = '') =>
  sanitizeHtml(String(html), {
    allowedTags: [
      'h2', 'h3', 'h4', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'span',
      'blockquote', 'pre', 'code', 'ul', 'ol', 'li', 'a', 'img', 'iframe', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      iframe: ['src', 'allowfullscreen', 'frameborder'],
      li: ['data-list'],          // Quill 2 marks bullet/ordered items this way
      td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'],
      '*': ['class', 'style'],
    },
    // only the editor's text / highlight colours — plain colour values, nothing else
    allowedStyles: {
      '*': {
        color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)$/i],
        'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*[\d.]+\s*)?\)$/i],
      },
    },
    allowedClasses: {
      '*': ['ql-align-center', 'ql-align-right', 'ql-align-justify', 'ql-video', 'ql-size-small', 'ql-size-large', 'ql-size-huge', /^ql-indent-\d$/],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    allowedIframeHostnames: VIDEO_HOSTS,
    // uploaded images are relative (/api/images/…) — keep those, block other relative oddities
    exclusiveFilter: (frame) =>
      (frame.tag === 'img' && !/^(https?:\/\/|\/api\/images\/)/.test(frame.attribs.src || '')) ||
      (frame.tag === 'iframe' && !frame.attribs.src), // video from a site that isn't allowed
    transformTags: {
      a: (tag, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href || '') && !/homwisor\.com/i.test(attribs.href || '')
        return { tagName: 'a', attribs: { ...attribs, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) } }
      },
    },
  }).slice(0, 300000)

// Plain words in the body (reading time, "is the article empty?")
export const htmlText = (html = '') => sanitizeHtml(String(html), { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim()

/* ---------------------------------------------------------------
   Old section-based articles → one HTML body
   (same text rules the old page used: "- " bullets, "1. A — b" checks,
   "> " tip boxes, "a | b" tables, **bold**)
--------------------------------------------------------------- */
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const inline = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

const textToHtml = (text = '') =>
  String(text).replace(/\r\n/g, '\n').split(/\n\s*\n/).map((chunk) => {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) return ''
    if (lines.every((l) => /^[-•*]\s+/.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^[-•*]\s+/, ''))}</li>`).join('')}</ul>`
    if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
      return `<ol>${lines.map((l) => {
        const body = l.replace(/^\d+[.)]\s+/, '')
        const m = body.match(/^(.+?)\s+[—–-]\s+(.+)$/)
        return `<li>${m ? `<strong>${inline(m[1])}</strong> — ${inline(m[2])}` : inline(body)}</li>`
      }).join('')}</ol>`
    }
    if (lines.every((l) => l.startsWith('>'))) return `<blockquote>${inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))}</blockquote>`
    if (lines.length >= 2 && lines.every((l) => l.includes('|'))) {
      const rows = lines.filter((l) => !/^\|?\s*:?-{2,}/.test(l)).map((l) => l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
      return `<ul>${rows.slice(1).map((r) => `<li><strong>${inline(r[0] || '')}</strong> — ${inline(r.slice(1).join(' · '))}</li>`).join('')}</ul>`
    }
    return `<p>${inline(lines.join(' '))}</p>`
  }).join('')

export const contentToHtml = (content = []) =>
  content.map((s) =>
    (s.heading ? `<h2>${esc(s.heading)}</h2>` : '') +
    textToHtml(s.text) +
    (s.image ? `<p><img src="${esc(s.image)}" alt="${esc(s.heading || '')}"></p>` : '')
  ).join('')

// Startup: give every old article a body made from its sections
export async function migrateBlogBodies() {
  const old = await Blog.find({ $or: [{ body: { $exists: false } }, { body: '' }, { body: null }], 'content.0': { $exists: true } })
  for (const b of old) {
    b.body = cleanBlogHtml(contentToHtml(b.content))
    await b.save()
  }
  if (old.length) console.log(`📝 Moved ${old.length} blog articles into the rich-text editor format`)
}
