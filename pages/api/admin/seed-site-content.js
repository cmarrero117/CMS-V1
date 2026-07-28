import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'
import connectDB from '../../../lib/db'
import Tenant from '../../../lib/models/Tenant'
import SiteContent from '../../../lib/models/SiteContent'

// GET /api/admin/seed-site-content
// Admin-only. Creates a blank SiteContent doc for every Tenant that lacks one.
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  await connectDB()

  const tenants = await Tenant.find({}).lean()
  const results = []

  for (const tenant of tenants) {
    const exists = await SiteContent.findOne({ siteSlug: tenant.slug })
    if (!exists) {
      await SiteContent.create({
        tenantId: tenant._id,
        siteSlug: tenant.slug,
        businessName: tenant.name || tenant.slug,
      })
      results.push({ slug: tenant.slug, action: 'created' })
    } else {
      results.push({ slug: tenant.slug, action: 'already exists' })
    }
  }

  return res.status(200).json({ seeded: results })
}
