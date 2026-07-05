import mongoose from 'mongoose'

const ContentEntrySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  siteSlug: { type: String, required: true },
  pageSlug: { type: String, required: true },
  sectionKey: { type: String, required: true },
  fieldKey: { type: String, required: true },
  value: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
})

// Compound index to ensure uniqueness per field per tenant
ContentEntrySchema.index(
  { tenantId: 1, siteSlug: 1, pageSlug: 1, sectionKey: 1, fieldKey: 1 },
  { unique: true }
)

export default mongoose.models.ContentEntry || mongoose.model('ContentEntry', ContentEntrySchema)
