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

const TeamMemberSchema = new mongoose.Schema({
  name:     { type: String, default: '' },
  title:    { type: String, default: '' },
  bio:      { type: String, default: '' },
  imageUrl: { type: String, default: '' }
}, { _id: false })

const TestimonialSchema = new mongoose.Schema({
  quote:  { type: String, default: '' },
  author: { type: String, default: '' },
  role:   { type: String, default: '' }
}, { _id: false })

const SiteContentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true
  },
  siteSlug: { type: String, required: true, unique: true },

  // ─── CONTENT SLOTS ───────────────────────────────────────
  businessName:    { type: String, default: '' },
  navSubtitle:     { type: String, default: '' }, // sub-label under business name in nav
  eyebrow:         { type: String, default: '' }, // small label above the hero headline
  heroHeadline:    { type: String, default: '' },
  heroSubheadline: { type: String, default: '' },
  heroCtaText:     { type: String, default: '' },
  heroCtaUrl:      { type: String, default: '' },
  aboutText:       { type: String, default: '' },
  navCtaText:      { type: String, default: '' }, // nav bar CTA button, e.g. "Book Appointment" / "Get Started"
  contactHeading:  { type: String, default: '' }, // contact section heading, e.g. "Book Your Appointment" / "Contact Us"

  // Scrolling trust bar items (e.g. "Accepting New Patients") — up to 6,
  // vertical-agnostic so any business type can set its own. Plain strings,
  // not a sub-schema, since there's nothing else to attach to one.
  trustBarItems: {
    type: [String],
    default: [],
    validate: {
      validator: (arr) => arr.length <= 6,
      message: 'A maximum of 6 trust bar items are allowed.'
    }
  },

  // About section stat tiles (4 tiles)
  stat1Number: { type: String, default: '' },
  stat1Label:  { type: String, default: '' },
  stat2Number: { type: String, default: '' },
  stat2Label:  { type: String, default: '' },
  stat3Number: { type: String, default: '' },
  stat3Label:  { type: String, default: '' },
  stat4Number: { type: String, default: '' },
  stat4Label:  { type: String, default: '' },

  // Up to 6 services
  services: {
    type: [ServiceSchema],
    default: [],
    validate: {
      validator: (arr) => arr.length <= 6,
      message: 'A maximum of 6 services are allowed.'
    }
  },

  // Up to 6 team members
  teamMembers: {
    type: [TeamMemberSchema],
    default: [],
    validate: {
      validator: (arr) => arr.length <= 6,
      message: 'A maximum of 6 team members are allowed.'
    }
  },

  // Up to 4 testimonials
  testimonials: {
    type: [TestimonialSchema],
    default: [],
    validate: {
      validator: (arr) => arr.length <= 4,
      message: 'A maximum of 4 testimonials are allowed.'
    }
  },

  contactPhone:   { type: String, default: '' },
  contactEmail:   { type: String, default: '' },
  contactAddress: { type: String, default: '' },

  logoUrl:      { type: String, default: '' },
  heroImageUrl: { type: String, default: '' },

  // ─── SEO SLOTS ───────────────────────────────────────────
  seoTitle:       { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  seoKeywords:    { type: String, default: '' },

  ogTitle:       { type: String, default: '' },
  ogDescription: { type: String, default: '' },
  ogImageUrl:    { type: String, default: '' },

  // ─────────────────────────────────────────────────────────
  updatedAt: { type: Date, default: Date.now }
})

SiteContentSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.SiteContent ||
  mongoose.model('SiteContent', SiteContentSchema)
