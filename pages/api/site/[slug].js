import dbConnect from '../../../lib/db'
import Tenant from '../../../lib/models/Tenant'
import User from '../../../lib/models/User'
import ContentEntry from '../../../lib/models/ContentEntry'

const BLOCKS = ['hero', 'about', 'contact']

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { slug } = req.query

  await dbConnect()

  // Look up tenant by slug
  const tenant = await Tenant.findOne({ slug }).lean()
  if (!tenant) return res.status(404).json({ error: 'Site not found' })

  // Look up the client user for this tenant
  const user = await User.findOne({ tenantId: tenant._id, role: 'client' }).lean()
  if (!user) return res.status(404).json({ error: 'Client not found' })

  // Fetch content entries using ownerEmail (matching save.js pattern)
  const entries = await ContentEntry.find({ ownerEmail: user.email }).lean()

  const content = {}
  BLOCKS.forEach(block => {
    const entry = entries.find(e => e.block === block)
    content[block] = entry ? entry.text : ''
  })

  return res.status(200).json({
    tenant: { name: tenant.name, slug: tenant.slug },
    content,
  })
}
