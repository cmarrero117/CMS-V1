import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'

export default function NewClient() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', siteSlug: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSlugify = (val) => {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

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
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '480px' }}>
      <Link href="/admin/clients" style={{ color: '#0070f3', fontSize: '0.875rem' }}>
        ← Back to All Clients
      </Link>

      <h1 style={{ marginTop: '1.25rem' }}>Add New Client</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={handleNameChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>Site Slug</label>
          <p style={{ margin: '0 0 0.35rem', color: '#666', fontSize: '0.8rem' }}>
            This becomes the public URL: <strong>/site/{form.siteSlug || 'example-slug'}</strong>
          </p>
          <input
            type="text"
            value={form.siteSlug}
            onChange={(e) => setForm({ ...form, siteSlug: handleSlugify(e.target.value) })}
            required
            placeholder="e.g. apex-pain-clinic"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'monospace' }}
          />
        </div>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '0.5rem 1.5rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? 'Creating...' : 'Create Client'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/clients')}
            style={{ padding: '0.5rem 1.5rem', background: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </form>
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
