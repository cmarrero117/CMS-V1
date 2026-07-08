import mongoose from 'mongoose'

/**
 * SiteContent.js
 *
 * One document per client site.
 * Stores all editable content + SEO slots that get injected
 * into the live /site/[slug] page. The site design/layout
 * is never touched — only these named values change.
 */

const ServiceSchema = new mongoose.Schema({
  title:       { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false })

const SiteContentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true   // one content doc per client
  },
  siteSlug: { type: String, required: true, unique: true },

  // ─── CONTENT SLOTS ───────────────────────────────────────
  businessName:    { type: String, default: '' },
  heroHeadline:    { type: String, default: '' },
  heroSubheadline: { type: String, default: '' },
  aboutText:       { type: String, default: '' },

  // Up to 6 services
  services: {
    type: [ServiceSchema],
    default: [],
    validate: {
      validator: (arr) => arr.length <= 6,
      message: 'A maximum of 6 services are allowed.'
    }
  },

  contactPhone:   { type: String, default: '' },
  contactEmail:   { type: String, default: '' },
  contactAddress: { type: String, default: '' },

  logoUrl:      { type: String, default: '' }, // client logo image URL
  heroImageUrl: { type: String, default: '' }, // hero/banner background image URL

  // ─── SEO SLOTS ───────────────────────────────────────────
  seoTitle:       { type: String, default: '' }, // <title> tag
  seoDescription: { type: String, default: '' }, // <meta name="description">
  seoKeywords:    { type: String, default: '' }, // comma-separated keywords

  ogTitle:       { type: String, default: '' }, // Open Graph title
  ogDescription: { type: String, default: '' }, // Open Graph description
  ogImageUrl:    { type: String, default: '' }, // social share image URL

  // ─────────────────────────────────────────────────────────
  updatedAt: { type: Date, default: Date.now }
})

// Refresh updatedAt on every save
SiteContentSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.SiteContent ||
  mongoose.model('SiteContent', SiteContentSchema)
