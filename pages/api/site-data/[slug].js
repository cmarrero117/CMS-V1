import connectDB from '../../../lib/db'
import SiteData from '../../../lib/models/SiteData'
import SiteSchema from '../../../lib/models/SiteSchema'
import Tenant from '../../../lib/models/Tenant'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'

// Walk the tenant's stored SiteSchema and keep only the keys/shape it
// declares — this is the dynamic-tenant equivalent of the fixed
// whitelist destructure in pages/api/site-content/[slug].js. Since
// field names aren't known ahead of time here, the schema itself is
// the source of truth for what's allowed, including each list's max.
function sanitize(fieldDefs, value) {
  const out = {}
  for (const f of fieldDefs || []) {
    if (!f || !f.key) continue
    const raw = value ? value[f.key] : undefined
    if (f.type === 'list') {
      const arr = Array.isArray(raw) ? raw : []
      const capped = typeof f.max === 'number' ? arr.slice(0, f.max) : arr
      out[f.key] = capped.map(item => sanitize(f.fields, item))
    } else {
      out[f.key] = typeof raw === 'string' ? raw : ''
    }
  }
  return out
}

export default async function handler(req, res) {
  const { slug } = req.query
  if (!slug) return res.status(400).json({ error: 'Missing slug' })

  await connectDB()

  if (req.method === 'GET') {
    const doc = await SiteData.findOne({ siteSlug: slug }).lean()
    if (!doc) return res.status(404).json({ error: 'No data found for this slug' })
    return res.status(200).json(doc)
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: 'Unauthorized' })

    const isAdmin = session.user.role === 'admin'
    const isOwner = session.user.siteSlug === slug
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: `Forbidden — session siteSlug "${session.user.siteSlug}" does not match "${slug}"`,
      })
    }

    const tenant = await Tenant.findOne({ slug }).lean()
    if (!tenant) return res.status(404).json({ error: 'Tenant not found for this slug' })

    const schemaDoc = await SiteSchema.findOne({ siteSlug: slug }).lean()
    if (!schemaDoc) {
      return res.status(404).json({ error: 'No schema defined for this slug — cannot save dynamic data without one' })
    }

    const allFields = (schemaDoc.sections || []).flatMap(s => s.fields || [])
    const sanitized = sanitize(allFields, req.body)

    const doc = await SiteData.findOneAndUpdate(
      { siteSlug: slug, tenantId: tenant._id },
      { $set: { siteSlug: slug, tenantId: tenant._id, data: sanitized, updatedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json(doc)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
