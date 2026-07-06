import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import dbConnect from '../../lib/db'
import User from '../../lib/models/User'
import Tenant from '../../lib/models/Tenant'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  await dbConnect()

  if (req.method === 'GET') {
    const clients = await User.find({ role: 'client' }).select('-password').lean()
    // Attach siteSlug by joining Tenant
    const tenantIds = clients.filter(c => c.tenantId).map(c => c.tenantId)
    const tenants = tenantIds.length
      ? await Tenant.find({ _id: { $in: tenantIds } }).lean()
      : []
    const tenantMap = {}
    tenants.forEach(t => { tenantMap[t._id.toString()] = t.slug })

    return res.status(200).json(
      clients.map(c => ({
        ...c,
        _id: c._id.toString(),
        tenantId: c.tenantId ? c.tenantId.toString() : null,
        siteSlug: c.tenantId ? (tenantMap[c.tenantId.toString()] || null) : null,
      }))
    )
  }

  if (req.method === 'POST') {
    const { name, email, password, siteSlug } = req.body

    if (!name || !email || !password || !siteSlug) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' })
    }

    const existingTenant = await Tenant.findOne({ slug: siteSlug })
    if (existingTenant) {
      return res.status(400).json({ error: 'That site slug is already taken' })
    }

    // Create tenant first
    const tenant = await Tenant.create({ name, slug: siteSlug, email })

    const hashed = await bcrypt.hash(password, 12)
    const client = await User.create({
      name,
      email,
      password: hashed,
      role: 'client',
      tenantId: tenant._id,
    })

    return res.status(201).json({
      id: client._id,
      email: client.email,
      name: client.name,
      siteSlug: tenant.slug,
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
