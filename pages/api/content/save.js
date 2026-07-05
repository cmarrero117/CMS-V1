import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'
import dbConnect from '../../../lib/db'
import ContentEntry from '../../../lib/models/ContentEntry'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getServerSession(req, res, authOptions)
  if (!session || session.user.role !== 'client') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { block, text } = req.body
  if (!block || text === undefined) {
    return res.status(400).json({ error: 'Missing block or text' })
  }

  await dbConnect()

  await ContentEntry.findOneAndUpdate(
    { ownerEmail: session.user.email, block },
    { ownerEmail: session.user.email, block, text, updatedAt: new Date() },
    { upsert: true, new: true }
  )

  return res.status(200).json({ success: true })
}
