/**
 * seed-apex.js
 * Populates the SiteContent document for the apex-pain-clinic slug
 * with all real content from cms-config.json.
 *
 * Run once from your local machine (needs .env.local with MONGODB_URI):
 *   node scripts/seed-apex.js
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not found in .env.local')
  process.exit(1)
}

// ── Minimal schemas (mirrors lib/models) ────────────────────────────────────
const TenantSchema = new mongoose.Schema({ name: String, slug: String, plan: String })

const SiteContentSchema = new mongoose.Schema({
  siteSlug:       { type: String, required: true },
  tenantId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  businessName:   String,
  heroHeadline:   String,
  heroSubheadline:String,
  heroCtaText:    String,
  heroCtaUrl:     String,
  aboutText:      String,
  services:       [{ title: String, description: String }],
  teamMembers:    [{ name: String, specialty: String, bio: String, tags: [String] }],
  contactPhone:   String,
  contactEmail:   String,
  contactAddress: String,
  logoUrl:        String,
  heroImageUrl:   String,
  seoTitle:       String,
  seoDescription: String,
  seoKeywords:    String,
  ogTitle:        String,
  ogDescription:  String,
  ogImageUrl:     String,
  updatedAt:      { type: Date, default: Date.now },
})

// ── Content payload (sourced from cms-config.json) ───────────────────────────
const SLUG = 'apex-pain-clinic'

const CONTENT = {
  businessName:    'Apex Pain Clinic',
  heroHeadline:    'Reclaim Your Life<br>From Chronic Pain',
  heroSubheadline: 'Personalized, compassionate care combining advanced interventional techniques with holistic treatment plans.',
  heroCtaText:     'Book a Consultation',
  heroCtaUrl:      '#contact',
  aboutText:       'Apex Pain Clinic was founded with a single purpose: to give patients suffering from chronic pain a clear, compassionate path forward. Our physicians combine decades of clinical experience with the latest interventional techniques to create individualized treatment plans.',
  services: [
    { title: 'Interventional Pain Management',  description: 'Minimally invasive procedures targeting the source of pain for lasting relief without the risks of open surgery.' },
    { title: 'Spinal Cord Stimulation',          description: 'Advanced neuromodulation therapy that disrupts pain signals before they reach the brain, offering relief for complex chronic pain conditions.' },
    { title: 'Joint Injections',                 description: 'Targeted corticosteroid and hyaluronic acid injections to reduce inflammation and restore joint mobility and comfort.' },
    { title: 'Nerve Blocks',                     description: 'Precise anesthetic injections that interrupt pain signals along specific nerve pathways for immediate and lasting relief.' },
    { title: 'Regenerative Medicine (PRP)',       description: 'Platelet-rich plasma therapy harnessing your body\'s own healing factors to repair damaged tissue and promote long-term recovery.' },
    { title: 'Medication Management',            description: 'Carefully monitored, evidence-based pharmacological plans integrated with your overall care strategy for safe, effective symptom control.' },
  ],
  teamMembers: [
    {
      name:      'Dr. Elena Vasquez, MD',
      specialty: 'Interventional Pain Medicine',
      bio:       'Dr. Vasquez brings over 18 years of experience in minimally invasive pain procedures, with subspecialty training in neuromodulation and spinal interventions.',
      tags:      ['Spinal Cord Stimulation', 'Epidural Injections', 'Nerve Blocks'],
    },
    {
      name:      'Dr. Marcus Chen, MD',
      specialty: 'Rehabilitation & Pain Management',
      bio:       'Dr. Chen specializes in rehabilitative approaches to chronic pain, combining physical medicine with interventional techniques for comprehensive patient outcomes.',
      tags:      ['Joint Injections', 'PRP Therapy', 'Medication Management'],
    },
    {
      name:      'Dr. Priya Nair, MD',
      specialty: 'Anesthesiology & Pain Medicine',
      bio:       'Dr. Nair\'s background in anesthesiology gives her a precision-focused approach to nerve blocks and complex regional pain syndrome management.',
      tags:      ['Nerve Blocks', 'CRPS Management', 'Ketamine Therapy'],
    },
  ],
  contactPhone:   '(305) 555-0100',
  contactEmail:   'info@apexpainclinic.com',
  contactAddress: '123 Wellness Blvd, Suite 400<br>Miami, FL 33101',
  seoTitle:       'Apex Pain Clinic',
  seoDescription: 'Apex Pain Clinic – Board-certified pain management combining interventional techniques with holistic care.',
  seoKeywords:    'pain clinic, interventional pain management, nerve blocks, PRP, spinal cord stimulation, Miami',
  updatedAt:      new Date(),
}

// ── Seed function ────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const Tenant       = mongoose.models.Tenant       || mongoose.model('Tenant', TenantSchema)
    const SiteContent  = mongoose.models.SiteContent  || mongoose.model('SiteContent', SiteContentSchema)

    const tenant = await Tenant.findOne({ slug: SLUG }).lean()
    if (!tenant) {
      console.error(`ERROR: No Tenant found with slug "${SLUG}". Run seed-admin.js first or create the tenant in the CMS.`)
      process.exit(1)
    }
    console.log(`✅ Tenant found: ${tenant.name} (${tenant._id})`)

    const result = await SiteContent.findOneAndUpdate(
      { siteSlug: SLUG, tenantId: tenant._id },
      { $set: { ...CONTENT, siteSlug: SLUG, tenantId: tenant._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    console.log(`✅ SiteContent seeded for "${SLUG}" (doc _id: ${result._id})`)
    console.log(`   Services seeded: ${result.services.length}`)
    console.log(`   Team members seeded: ${result.teamMembers.length}`)
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

seed()
