import connectDB from '../../../lib/db'
import Tenant from '../../../lib/models/Tenant'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const session = await getSession({ req })
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  await connectDB()

  if (req.method === 'GET') {
    const tenants = await Tenant.find({})
    return res.status(200).json(tenants)
  }

  if (req.method === 'POST') {
    const { name, slug, email } = req.body
    const tenant = await Tenant.create({ name, slug, email })
    return res.status(201).json(tenant)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
