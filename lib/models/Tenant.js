import mongoose from 'mongoose'

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
})

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema)
