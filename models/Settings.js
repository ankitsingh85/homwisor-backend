import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  siteName: { type: String, default: 'HomWisor.com' },
  contactPhone: { type: String, default: '8500 900 100' },
  contactEmail: { type: String, default: 'info@HomWisor.com' },
  address: { type: String, default: 'Gurugram, Haryana' }
}, { timestamps: true, collection: 'settings' })

export default mongoose.model('Settings', settingsSchema)
