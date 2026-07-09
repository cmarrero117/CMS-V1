import connectDB from '../../../lib/db'
import SiteContent from '../../../lib/models/SiteContent'
import Tenant from '../../../lib/models/Tenant'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const { slug } = req.query
  if (!slug) return res.status(400).json({ error: 'Missing slug' })

  await connectDB()

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const doc = await SiteContent.findOne({ siteSlug: slug }).lean()
    if (!doc) return res.status(404).json({ error: 'No content found for this slug' })
    return res.status(200).json(doc)
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)

    // DEBUG — remove once save is confirmed working
    console.log('[site-content POST] session.user =', JSON.stringify(session?.user))

    if (!session) return res.status(401).json({ error: 'Unauthorized' })

    const isAdmin = session.user.role === 'admin'
    const isOwner = session.user.siteSlug === slug

    console.log('[site-content POST] isAdmin:', isAdmin, '| isOwner:', isOwner, '| slug:', slug)

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: `Forbidden — session siteSlug "${session.user.siteSlug}" does not match "${slug}"`,
      })
    }

    const tenant = await Tenant.findOne({ slug }).lean()
    if (!tenant) return res.status(404).json({ error: 'Tenant not found for this slug' })

    const {
      businessName, heroHeadline, heroSubheadline, aboutText, services,
      contactPhone, contactEmail, contactAddress, logoUrl, heroImageUrl,
      seoTitle, seoDescription, seoKeywords, ogTitle, ogDescription, ogImageUrl,
    } = req.body

    const update = {
      siteSlug:        slug,
      tenantId:        tenant._id,
      businessName:    businessName || tenant.name || '',
      heroHeadline,
      heroSubheadline,
      aboutText,
      services:        Array.isArray(services) ? services.slice(0, 6) : [],
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
      updatedAt:       new Date(),
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
