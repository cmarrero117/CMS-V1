import connectDB from '../../../lib/db'
import ContentEntry from '../../../lib/models/ContentEntry'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  await connectDB()

  if (req.method === 'GET') {
    const { tenantId, siteSlug, pageSlug } = req.query
    // Clients can only access their own tenant content
    const scopedTenantId = session.user.role === 'admin' ? tenantId : session.user.tenantId
    const entries = await ContentEntry.find({ tenantId: scopedTenantId, siteSlug, pageSlug })
    return res.status(200).json(entries)
  }

  if (req.method === 'POST') {
    const { tenantId, siteSlug, pageSlug, sectionKey, fieldKey, value } = req.body
    const scopedTenantId = session.user.role === 'admin' ? tenantId : session.user.tenantId
    const entry = await ContentEntry.findOneAndUpdate(
      { tenantId: scopedTenantId, siteSlug, pageSlug, sectionKey, fieldKey },
      { value, updatedAt: new Date() },
      { upsert: true, new: true }
    )
    return res.status(200).json(entry)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
