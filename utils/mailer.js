// Lead notification emails (nodemailer over SMTP).
// homwisor.com email is hosted by Hostinger, so that's the default server.
//
// .env:
//   SMTP_USER=leads@homwisor.com      the mailbox that sends the mail (full address)
//   SMTP_PASS=…                        that mailbox's password
//   SMTP_HOST / SMTP_PORT              optional — default smtp.hostinger.com : 465 (SSL)
//                                      (Gmail: smtp.gmail.com + a Google App Password)
//   LEADS_EMAIL=leads@homwisor.com     optional — property / blog / site forms go here
//   SUPPORT_EMAIL=support@homwisor.com optional — contact page form goes here
//
// Without SMTP_USER / SMTP_PASS emails are skipped (enquiries are still saved).
import nodemailer from 'nodemailer'

const LEADS_EMAIL = () => process.env.LEADS_EMAIL || 'leads@homwisor.com'
const SUPPORT_EMAIL = () => process.env.SUPPORT_EMAIL || 'support@homwisor.com'

let transporter = null
let warned = false

function getTransporter() {
  const user = (process.env.SMTP_USER || '').trim()
  const host = (process.env.SMTP_HOST || 'smtp.hostinger.com').trim()
  let pass = process.env.SMTP_PASS || ''
  if (/gmail\.com$/i.test(host)) pass = pass.replace(/\s+/g, '') // Google shows app passwords in groups of 4
  if (!user || !pass) {
    if (!warned) { console.warn('✉️  Email not configured (set SMTP_USER and SMTP_PASS) — enquiry emails are skipped'); warned = true }
    return null
  }
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
  }
  return transporter
}

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const oneLine = (s = '') => String(s).replace(/[\r\n]+/g, ' ').trim()

const SOURCE_LABEL = {
  contact: 'Contact page',
  property: 'Property page',
  blog: 'Blog article',
  sell: 'Sell property',
  popup: 'Popup form',
  other: 'Website',
}

function leadEmail(e) {
  const isContact = e.source === 'contact'
  const label = SOURCE_LABEL[e.source] || SOURCE_LABEL.other
  const about = e.property || e.subject || ''
  const subject = oneLine(isContact
    ? `New contact message${e.subject ? `: ${e.subject}` : ''} — ${e.name}`
    : `New lead: ${about || label} — ${e.name}`).slice(0, 180)

  const site = process.env.SITE_URL || 'https://homwisor.com'
  const pageUrl = e.page ? site.replace(/\/$/, '') + (e.page.startsWith('/') ? e.page : `/${e.page}`) : ''
  const phoneDigits = String(e.phone || '').replace(/[^\d+]/g, '')
  const waNumber = phoneDigits.replace(/^\+/, '').replace(/^(\d{10})$/, '91$1')

  const rows = [
    ['Name', esc(e.name)],
    ['Phone', e.phone ? `<a href="tel:${esc(phoneDigits)}" style="color:#9A7418;font-weight:700;text-decoration:none">${esc(e.phone)}</a>` : ''],
    ['Email', e.email ? `<a href="mailto:${esc(e.email)}" style="color:#9A7418;text-decoration:none">${esc(e.email)}</a>` : ''],
    [isContact ? 'Interested in' : 'Property / topic', esc(about)],
    ['Message', esc(e.message).replace(/\n/g, '<br>')],
    ['Form', esc(label)],
    ['Page', pageUrl ? `<a href="${esc(pageUrl)}" style="color:#9A7418;text-decoration:none">${esc(e.page)}</a>` : ''],
    ['Received', esc(new Date(e.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }))],
  ].filter(([, v]) => v)

  const html = `<!doctype html><html><body style="margin:0;background:#f6f3ea;font-family:Arial,Helvetica,sans-serif;color:#2b2718">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ea;padding:24px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #ece6d6">
      <tr><td style="background:#0b0b0b;padding:20px 24px">
        <div style="color:#E8C766;font-size:11px;font-weight:700;letter-spacing:2px">HOMWISOR · ${esc(label.toUpperCase())}</div>
        <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:6px">${isContact ? 'New contact message' : 'New enquiry'}</div>
      </td></tr>
      <tr><td style="padding:8px 24px 4px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${rows.map(([k, v]) => `<tr><td style="padding:10px 0;border-bottom:1px solid #f0ebdd;width:130px;vertical-align:top;font-size:12px;font-weight:700;color:#8f8873;text-transform:uppercase;letter-spacing:.5px">${k}</td><td style="padding:10px 0;border-bottom:1px solid #f0ebdd;font-size:15px;line-height:1.5">${v}</td></tr>`).join('')}
        </table>
      </td></tr>
      ${phoneDigits ? `<tr><td style="padding:16px 24px 24px">
        <a href="tel:${esc(phoneDigits)}" style="display:inline-block;background:#0b0b0b;color:#E8C766;padding:11px 18px;border-radius:999px;font-weight:700;font-size:13px;text-decoration:none">Call ${esc(e.name.split(' ')[0])}</a>
        &nbsp;<a href="https://wa.me/${esc(waNumber)}" style="display:inline-block;background:#25D366;color:#ffffff;padding:11px 18px;border-radius:999px;font-weight:700;font-size:13px;text-decoration:none">WhatsApp</a>
      </td></tr>` : ''}
    </table>
    <div style="font-size:11px;color:#8f8873;margin-top:12px">Also saved in Admin → Enquiries.</div>
  </td></tr></table></body></html>`

  // plain-text version for mail apps that don't show HTML
  const text = [
    isContact ? 'New contact message' : 'New enquiry',
    `Name: ${e.name}`, e.phone && `Phone: ${e.phone}`, e.email && `Email: ${e.email}`,
    about && `${isContact ? 'Interested in' : 'Property / topic'}: ${about}`,
    e.message && `Message: ${e.message}`, `Form: ${label}`, pageUrl && `Page: ${pageUrl}`,
  ].filter(Boolean).join('\n')

  return { to: isContact ? SUPPORT_EMAIL() : LEADS_EMAIL(), subject, html, text }
}

// Fire-and-forget: never throws, never delays the visitor's response
export async function sendEnquiryEmail(enquiry) {
  const t = getTransporter()
  if (!t) return false
  const mail = leadEmail(enquiry)
  try {
    await t.sendMail({
      from: `"HomWisor Website" <${process.env.SMTP_USER}>`,
      to: mail.to,
      replyTo: enquiry.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email) ? enquiry.email : undefined,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    })
    console.log(`✉️  Enquiry email sent to ${mail.to} (${enquiry.source || 'other'})`)
    return true
  } catch (err) {
    console.error(`✉️  Enquiry email to ${mail.to} failed:`, err.message)
    return false
  }
}

// For tests / previews without sending
export const _leadEmail = leadEmail
