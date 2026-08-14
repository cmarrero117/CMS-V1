import mongoose from 'mongoose'

/**
 * SiteData.js
 *
 * The *values* for a dynamic tenant — a flat object keyed by each
 * top-level field's `key`, unique across all of that tenant's
 * SiteSchema sections (mirrors how SiteContent's fixed dashboard form
 * state is flat regardless of which section a field is shown under).
 * Shape is validated against the tenant's SiteSchema at write time
 * (see pages/api/site-data/[slug].js) — Mongoose itself imposes no
 * structure on `data`, since the whole point is that it varies per
 * tenant.
 */

const SiteDataSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true
  },
  siteSlug: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.models.SiteData ||
  mongoose.model('SiteData', SiteDataSchema)
