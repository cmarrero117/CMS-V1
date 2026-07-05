import { getSession } from 'next-auth/react'
import dbConnect from '../../lib/dbConnect'
import User from '../../lib/models/User'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  const session = await getSession({ req })

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  await dbConnect()

  if (req.method === 'GET') {
    const clients = await User.find({ role: 'client' }).select('-password')
    return res.status(200).json(clients)
  }

  if (req.method === 'POST') {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const client = await User.create({ name, email, password: hashed, role: 'client' })

    return res.status(201).json({ id: client._id, email: client.email, name: client.name })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
