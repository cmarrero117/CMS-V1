import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'
import { serialize } from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  // Clear the impersonation cookie set by /api/admin/impersonate
  res.setHeader('Set-Cookie', serialize('adminViewingTenantId', '', {
    httpOnly: true,
    path: '/',
    maxAge: -1,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  }))

  return res.status(200).json({ ok: true })
}
