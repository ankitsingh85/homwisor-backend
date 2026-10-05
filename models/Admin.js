import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 120 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  active: { type: Boolean, default: true },
  mustChangePassword: { type: Boolean, default: false },
  // Tokens issued before this moment are rejected (set on every password change)
  passwordChangedAt: { type: Date, default: Date.now },
  lastLoginAt: Date,
  createdBy: String
}, { timestamps: true, collection: 'admins' })

adminSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 12)
  // 1s back-dating so a token issued in the same second as the change stays valid
  this.passwordChangedAt = new Date(Date.now() - 1000)
}

adminSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

adminSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    active: this.active,
    mustChangePassword: this.mustChangePassword,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    createdBy: this.createdBy || ''
  }
}

export default mongoose.model('Admin', adminSchema)
