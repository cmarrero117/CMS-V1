import connectDB from '../../../lib/db'
import SiteSchema from '../../../lib/models/SiteSchema'
import Tenant from '../../../lib/models/Tenant'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'

// Structural definition of a dynamic tenant's editable content.
// GET is public (the client dashboard needs it unauthenticated the
// same way site-content GET is public); POST is admin-only since
// changing structure is a design decision, not a content edit.
export default async function handler(req, res) {
  const { slug } = req.query
  if (!slug) return res.status(400).json({ error: 'Missing slug' })

  await connectDB()

  if (req.method === 'GET') {
    const doc = await SiteSchema.findOne({ siteSlug: slug }).lean()
    if (!doc) return res.status(404).json({ error: 'No schema found for this slug' })
    return res.status(200).json(doc)
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: 'Unauthorized' })
    if (session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can define a site schema' })
    }

    const tenant = await Tenant.findOne({ slug }).lean()
    if (!tenant) return res.status(404).json({ error: 'Tenant not found for this slug' })

    const { sections } = req.body
    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: '"sections" must be an array' })
    }

    const doc = await SiteSchema.findOneAndUpdate(
      { siteSlug: slug, tenantId: tenant._id },
      { $set: { siteSlug: slug, tenantId: tenant._id, sections, updatedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json(doc)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
