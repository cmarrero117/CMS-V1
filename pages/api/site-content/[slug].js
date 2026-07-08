import connectDB from '../../../lib/db'
import SiteContent from '../../../lib/models/SiteContent'
import Tenant from '../../../lib/models/Tenant'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

/**
 * /api/site-content/[slug]
 *
 * GET  — fetch all content + SEO slots for a site
 *        Public (used by the live /site/[slug] page)
 *
 * POST — save updated content + SEO slots
 *        Protected: client can only save their own site,
 *        admin can save any site
 */
export default async function handler(req, res) {
  const { slug } = req.query
  if (!slug) return res.status(400).json({ error: 'Missing slug' })

  await connectDB()

  // ── GET ── public read, no auth required ────────────────────────────────
  if (req.method === 'GET') {
    const doc = await SiteContent.findOne({ siteSlug: slug }).lean()
    if (!doc) return res.status(404).json({ error: 'No content found for this slug' })
    return res.status(200).json(doc)
  }

  // ── POST ── protected write ──────────────────────────────────────────────
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: 'Unauthorized' })

    // Resolve the tenant for this slug
    const tenant = await Tenant.findOne({ slug }).lean()
    if (!tenant) return res.status(404).json({ error: 'Tenant not found for this slug' })

    // Clients can only update their own site
    if (
      session.user.role !== 'admin' &&
      String(session.user.tenantId) !== String(tenant._id)
    ) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Whitelist only the fields defined in SiteContent
    const {
      businessName,
      heroHeadline,
      heroSubheadline,
      aboutText,
      services,
      contactPhone,
      contactEmail,
      contactAddress,
      logoUrl,
      heroImageUrl,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogTitle,
      ogDescription,
      ogImageUrl,
    } = req.body

    const update = {
      // ← FIX: include required fields so upsert (first-save) succeeds
      siteSlug: slug,
      tenantId: tenant._id,
      businessName,
      heroHeadline,
      heroSubheadline,
      aboutText,
      services: Array.isArray(services) ? services.slice(0, 6) : [],
      contactPhone,
      contactEmail,
      contactAddress,
      logoUrl,
      heroImageUrl,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogTitle,
      ogDescription,
      ogImageUrl,
      updatedAt: new Date(),
    }

    const doc = await SiteContent.findOneAndUpdate(
      { siteSlug: slug, tenantId: tenant._id },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json(doc)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
