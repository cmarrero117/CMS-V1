import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '0.9rem',
  color: '#111827',
  background: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.4rem',
  fontWeight: 600,
  fontSize: '0.875rem',
  color: '#374151',
}

export default function NewClient() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', siteSlug: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSlugify = (val) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleNameChange = (e) => {
    const name = e.target.value
    setForm(f => ({
      ...f,
      name,
      siteSlug: f.siteSlug === '' || f.siteSlug === handleSlugify(f.name)
        ? handleSlugify(name)
        : f.siteSlug,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (!form.siteSlug) {
      setError('Site slug is required')
      setLoading(false)
      return
    }
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }
    router.push('/admin/clients')
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
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        <Link href="/admin/clients" style={{ fontSize: '0.8rem', color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
          ← Back to All Clients
        </Link>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>Add New Client</h1>
          <p style={{ margin: '0.35rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>Create a login and spin up a new site for your client.</p>
        </div>

        {/* Form Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '2rem',
        }}>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Business Name</label>
              <input
                type="text"
                value={form.name}
                onChange={handleNameChange}
                required
                placeholder="e.g. Apex Pain Clinic"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="client@example.com"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Set a temporary password"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={labelStyle}>Site Slug</label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#fff',
              }}>
                <span style={{
                  padding: '10px 12px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  borderRight: '1px solid #e5e7eb',
                  whiteSpace: 'nowrap',
                }}>
                  /site/
                </span>
                <input
                  type="text"
                  value={form.siteSlug}
                  onChange={(e) => setForm({ ...form, siteSlug: handleSlugify(e.target.value) })}
                  required
                  placeholder="apex-pain-clinic"
                  style={{ ...inputStyle, border: 'none', borderRadius: 0, fontFamily: 'monospace' }}
                />
              </div>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: '#9ca3af' }}>
                Auto-generated from the business name. You can edit it manually.
              </p>
            </div>

            {error && (
              <div style={{
                marginBottom: '1.25rem',
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: loading ? '#a5b4fc' : '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Creating...' : 'Create Client'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/clients')}
                style={{
                  padding: '11px 20px',
                  background: 'transparent',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}
