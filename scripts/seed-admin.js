/**
 * seed-admin.js
 * Run once to create your admin account:
 * node scripts/seed-admin.js your@email.com yourpassword
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not found in .env.local')
  process.exit(1)
}

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: node scripts/seed-admin.js your@email.com yourpassword')
  process.exit(1)
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null },
  createdAt: { type: Date, default: Date.now }
})

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    const existing = await User.findOne({ email })
    if (existing) {
      console.log(`User ${email} already exists. Skipping.`)
      process.exit(0)
    }

    const hashed = await bcrypt.hash(password, 12)
    await User.create({ email, password: hashed, role: 'admin' })

    console.log(`✅ Admin user created: ${email}`)
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

seed()
