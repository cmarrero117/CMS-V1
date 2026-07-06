import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import dbConnect from '../../lib/db'
import User from '../../lib/models/User'
import Tenant from '../../lib/models/Tenant'

export default function ClientsPage({ clients: initialClients }) {
  const router = useRouter()
  const [clients, setClients] = useState(initialClients)
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (id) => {
    setDeleting(id)
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setClients(prev => prev.filter(c => c._id !== id))
      setConfirmId(null)
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to delete client')
    }
    setDeleting(null)
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>All Clients</h1>
      {clients.length === 0 && <p style={{ color: '#888' }}>No clients yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {clients.map(c => (
          <li key={c._id} style={{
            marginBottom: '0.6rem',
            padding: '0.75rem 1rem',
            background: '#f5f5f5',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            <div>
              <span style={{ fontWeight: '500' }}>{c.name || '(no name)'}</span>
              <span style={{ color: '#666', marginLeft: '0.5rem' }}>— {c.email}</span>
              {c.siteSlug && (
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                  /site/{c.siteSlug}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {c.siteSlug && (
                <Link
                  href={`/site/${c.siteSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.875rem', color: '#16a34a', textDecoration: 'none' }}
                >
                  View Live Site ↗
                </Link>
              )}
              <Link
                href={`/admin/clients/${c._id}`}
                style={{ fontSize: '0.875rem', color: '#0070f3', textDecoration: 'none' }}
              >
                View Content →
              </Link>

              {confirmId === c._id ? (
                <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#b91c1c' }}>Delete?</span>
                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={deleting === c._id}
                    style={{
                      padding: '0.2rem 0.6rem',
                      background: '#b91c1c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {deleting === c._id ? 'Deleting...' : 'Yes, delete'}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    style={{
                      padding: '0.2rem 0.6rem',
                      background: '#e5e7eb',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmId(c._id)}
                  style={{
                    padding: '0.2rem 0.6rem',
                    background: 'transparent',
                    border: '1px solid #fca5a5',
                    color: '#b91c1c',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '1.5rem' }}>
        <Link href="/admin/clients/new" style={{ color: '#0070f3', textDecoration: 'none' }}>+ Add New Client</Link>
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

  const tenantIds = clients.filter(c => c.tenantId).map(c => c.tenantId)
  const tenants = tenantIds.length
    ? await Tenant.find({ _id: { $in: tenantIds } }).lean()
    : []
  const tenantMap = {}
  tenants.forEach(t => { tenantMap[t._id.toString()] = t.slug })

  return {
    props: {
      clients: clients.map(c => ({
        _id: c._id.toString(),
        name: c.name || null,
        email: c.email || null,
        siteSlug: c.tenantId ? (tenantMap[c.tenantId.toString()] || null) : null,
      }))
    }
  }
}
