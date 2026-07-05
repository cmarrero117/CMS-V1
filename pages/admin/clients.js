import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import dbConnect from '../../lib/db'
import User from '../../lib/models/User'

export default function ClientsPage({ clients }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>All Clients</h1>
      {clients.length === 0 && <p>No clients yet.</p>}
      <ul>
        {clients.map(c => (
          <li key={c._id}>{c.name} — {c.email}</li>
        ))}
      </ul>
      <a href="/admin/clients/new">+ Add New Client</a>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login', permanent: false } }
  }

  await dbConnect()
  const clients = await User.find({ role: 'client' }).select('-password').lean()

  return {
    props: {
      clients: clients.map(c => ({
        _id: c._id.toString(),
        name: c.name,
        email: c.email,
      }))
    }
  }
}
