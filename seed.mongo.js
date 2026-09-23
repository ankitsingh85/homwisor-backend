// Seed MongoDB with the default demo data (wipes and re-inserts all collections)
// Usage: npm run seed:mongo
import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import { seedForce } from './utils/seed.js'

const conn = await connectDB()
if (!conn) process.exit(1)

await seedForce()
await mongoose.disconnect()
