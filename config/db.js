import mongoose from 'mongoose'

const connectDB = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.log('⚠️  No MONGODB_URI — running without MongoDB (use file/in-memory mode or set URI in .env)')
    return null
  }
  try {
    const conn = await mongoose.connect(uri)
    console.log(`✅ MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`)
    return conn
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`)
    console.log('   → Check MONGODB_URI in .env, whitelist IP in Atlas, and try again')
    // don't exit — allow file fallback for demo, but in production you should exit
    // process.exit(1)
    return null
  }
}

export default connectDB
