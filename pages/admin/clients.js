import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import dbConnect from '../../lib/db'
import User from '../../lib/models/User'

export default function ClientsPage({ clients }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>All Clients</h1>
      {clients.length === 0 && <p>No clients yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {clients.map(c => (
          <li key={c._id} style={{ marginBottom: '0.6rem', padding: '0.6rem 1rem', background: '#f5f5f5', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{c.name || '(no name)'} — {c.email}</span>
            <Link href={`/admin/clients/${c._id}`} style={{ fontSize: '0.875rem', color: '#0070f3' }}>
              View Content →
            </Link>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '1.5rem' }}>
        <a href="/admin/clients/new" style={{ color: '#0070f3' }}>+ Add New Client</a>
      </div>
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
        name: c.name || null,
        email: c.email || null,
      }))
    }
  }
}
