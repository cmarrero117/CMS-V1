import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import dbConnect from '../../lib/db'
import User from '../../lib/models/User'
import Tenant from '../../lib/models/Tenant'

export default function ClientsPage({ clients: initialClients }) {
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
    <div style={{ minHeight: '100vh', background: '#f8f8fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* Top Nav */}
      <nav style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/admin" style={{ fontWeight: 700, fontSize: '1.2rem', color: '#4f46e5', letterSpacing: '-0.5px', textDecoration: 'none' }}>
          Canvō
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            background: 'transparent',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </nav>

      {/* Page Content */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link href="/admin" style={{ fontSize: '0.8rem', color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginBottom: '0.4rem' }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>All Clients</h1>
            <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>{clients.length} client{clients.length !== 1 ? 's' : ''} registered</p>
          </div>
          <Link
            href="/admin/clients/new"
            style={{
              background: '#4f46e5',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            + Add New Client
          </Link>
        </div>

        {/* Empty State */}
        {clients.length === 0 && (
          <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            padding: '3rem',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👤</div>
            <p style={{ margin: 0, fontWeight: 500 }}>No clients yet.</p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem' }}>Click “+ Add New Client” to get started.</p>
          </div>
        )}

        {/* Client Cards */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {clients.map(c => (
            <li
              key={c._id}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              {/* Client Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: '#ede9fe', color: '#4f46e5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                  }}>
                    {(c.name || c.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{c.name || '(no name)'}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: '0.5rem' }}>{c.email}</span>
                  </div>
                </div>
                {c.siteSlug && (
                  <span style={{ display: 'inline-block', marginTop: '0.4rem', marginLeft: '2.75rem', fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace', background: '#f3f4f6', padding: '1px 6px', borderRadius: '4px' }}>
                    /site/{c.siteSlug}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {c.siteSlug && (
                  <Link
                    href={`/site/${c.siteSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.8rem', color: '#16a34a', textDecoration: 'none',
                      border: '1px solid #bbf7d0', borderRadius: '6px',
                      padding: '5px 10px', fontWeight: 500,
                    }}
                  >
                    View Site ↗
                  </Link>
                )}
                <Link
                  href={`/admin/clients/${c._id}`}
                  style={{
                    fontSize: '0.8rem', color: '#4f46e5', textDecoration: 'none',
                    border: '1px solid #c7d2fe', borderRadius: '6px',
                    padding: '5px 10px', fontWeight: 500,
                  }}
                >
                  View Content →
                </Link>

                {confirmId === c._id ? (
                  <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 500 }}>Sure?</span>
                    <button
                      onClick={() => handleDelete(c._id)}
                      disabled={deleting === c._id}
                      style={{
                        padding: '5px 10px', background: '#b91c1c', color: '#fff',
                        border: 'none', borderRadius: '6px', fontSize: '0.8rem',
                        fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      {deleting === c._id ? 'Deleting...' : 'Yes, delete'}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      style={{
                        padding: '5px 10px', background: '#f3f4f6',
                        border: '1px solid #e5e7eb', borderRadius: '6px',
                        fontSize: '0.8rem', cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmId(c._id)}
                    style={{
                      padding: '5px 10px', background: 'transparent',
                      border: '1px solid #fca5a5', color: '#b91c1c',
                      borderRadius: '6px', fontSize: '0.8rem',
                      cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
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
