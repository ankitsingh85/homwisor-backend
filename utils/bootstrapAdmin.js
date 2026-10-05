import Admin from '../models/Admin.js'
import { EMAIL_RE, passwordProblem } from './validate.js'

// One-off migration from username-based accounts: give any admin without an
// email "<username>@homwisor.com" (password unchanged), then sync indexes so
// the old unique username index is replaced by the unique email index.
const migrateToEmail = async () => {
  const col = Admin.collection
  const legacy = await col.find({ $or: [{ email: { $exists: false } }, { email: '' }, { email: null }] }).toArray()
  for (const doc of legacy) {
    const base = (doc.username || 'admin').toLowerCase()
    let email = `${base}@homwisor.com`
    if (await col.findOne({ email, _id: { $ne: doc._id } })) email = `${base}-${doc._id.toString().slice(-4)}@homwisor.com`
    await col.updateOne({ _id: doc._id }, { $set: { email } })
    console.log(`👤 Admin "${doc.username}" now signs in with ${email}`)
  }
  await Admin.syncIndexes()
}

// Creates the first super admin when the admins collection is empty.
// Uses ADMIN_EMAIL / ADMIN_PASSWORD if set; otherwise admin@homwisor.com /
// admin123 with a forced password change on first login.
export const bootstrapAdmin = async () => {
  await migrateToEmail()
  if (await Admin.countDocuments() > 0) return

  const envEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const envPass = process.env.ADMIN_PASSWORD || ''
  const useEnv = envEmail && envPass && EMAIL_RE.test(envEmail) && !passwordProblem(envPass, envEmail)

  if ((envEmail || envPass) && !useEnv) {
    console.warn('⚠️  ADMIN_EMAIL / ADMIN_PASSWORD are invalid (password needs 8+ chars with letters and numbers) — using the default admin instead')
  }

  const email = useEnv ? envEmail : 'admin@homwisor.com'
  const admin = new Admin({
    name: 'Super Admin',
    email,
    role: 'superadmin',
    mustChangePassword: !useEnv,
    createdBy: 'system'
  })
  await admin.setPassword(useEnv ? envPass : 'admin123')
  await admin.save()

  console.log(useEnv
    ? `👤 Created super admin ${email} from ADMIN_EMAIL / ADMIN_PASSWORD`
    : '👤 Created default super admin admin@homwisor.com / admin123 — the password must be changed at first login')
}
