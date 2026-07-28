import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'
import dbConnect from '../../../lib/db'
import SiteContent from '../../../lib/models/SiteContent'
import Tenant from '../../../lib/models/Tenant'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user.role !== 'client') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const siteSlug = session.user.siteSlug
  if (!siteSlug) {
    return res.status(400).json({ error: 'No siteSlug on session — contact admin' })
  }

  await dbConnect()

  const tenant = await Tenant.findOne({ slug: siteSlug }).lean()
  if (!tenant) return res.status(404).json({ error: 'Tenant not found for slug: ' + siteSlug })

  // Accept either a full content object (bulk) or a single { block, text } pair
  let update = {}

  if (req.body && typeof req.body === 'object' && !req.body.block) {
    // Bulk save — full content object passed directly (same shape as SiteContent fields)
    const allowed = [
      'businessName','navSubtitle','heroHeadline','heroSubheadline','heroCtaText','heroCtaUrl',
      'aboutText','services','teamMembers','testimonials',
      'contactPhone','contactEmail','contactAddress',
      'logoUrl','heroImageUrl',
      'seoTitle','seoDescription','seoKeywords',
      'ogTitle','ogDescription','ogImageUrl',
      'stat1Number','stat1Label','stat2Number','stat2Label',
      'stat3Number','stat3Label','stat4Number','stat4Label',
    ]
    allowed.forEach(key => {
      if (req.body[key] !== undefined) update[key] = req.body[key]
    })
  } else {
    // Legacy single-block save { block, text }
    const { block, text } = req.body
    if (!block || text === undefined) {
      return res.status(400).json({ error: 'Missing block or text' })
    }
    update[block] = text
  }

  update.updatedAt = new Date()

  const doc = await SiteContent.findOneAndUpdate(
    { siteSlug, tenantId: tenant._id },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  return res.status(200).json({ success: true, doc })
}
