import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'
import dbConnect from '../../../lib/db'
import User from '../../../lib/models/User'
import Tenant from '../../../lib/models/Tenant'
import ContentEntry from '../../../lib/models/ContentEntry'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  await dbConnect()

  const user = await User.findById(id)
  if (!user || user.role !== 'client') {
    return res.status(404).json({ error: 'Client not found' })
  }

  // Delete all content entries for this client
  await ContentEntry.deleteMany({ ownerEmail: user.email })

  // Delete the tenant if one is linked
  if (user.tenantId) {
    await Tenant.findByIdAndDelete(user.tenantId)
  }

  // Delete the user
  await User.findByIdAndDelete(id)

  return res.status(200).json({ success: true })
}
