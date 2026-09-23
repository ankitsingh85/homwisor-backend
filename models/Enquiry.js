import mongoose from 'mongoose'

const enquirySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  email: String,
  property: String,
  message: String,
  date: { type: String, default: () => new Date().toISOString().slice(0,10) }
}, { timestamps: true, collection: 'enquiries' })

export default mongoose.model('Enquiry', enquirySchema)
