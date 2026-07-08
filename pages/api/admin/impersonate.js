import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { serialize } from 'cookie'
import dbConnect from '../../../lib/db'
import User from '../../../lib/models/User'
import Tenant from '../../../lib/models/Tenant'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { clientId } = req.body
  if (!clientId) return res.status(400).json({ error: 'clientId required' })

  await dbConnect()

  const user = await User.findById(clientId).lean()
  if (!user || user.role !== 'client') {
    return res.status(404).json({ error: 'Client not found' })
  }

  const tenant = await Tenant.findById(user.tenantId).lean()
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found for this client' })
  }

  // Set a short-lived HttpOnly cookie that client/index.js will read server-side
  res.setHeader('Set-Cookie', serialize('adminViewingTenantId', tenant._id.toString(), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 30, // 30 minutes
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  }))

  return res.status(200).json({ ok: true, slug: tenant.slug })
}
