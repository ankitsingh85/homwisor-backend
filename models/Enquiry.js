import mongoose from 'mongoose'

const enquirySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  email: String,
  property: String,
  message: String,
  subject: String,                                    // contact page: "I'm interested in"
  source: { type: String, default: 'other' },        // contact | property | blog | other — decides who gets the email
  page: String,                                       // page the form was sent from
  date: { type: String, default: () => new Date().toISOString().slice(0,10) }
}, { timestamps: true, collection: 'enquiries' })

export default mongoose.model('Enquiry', enquirySchema)
