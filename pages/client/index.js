import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import dbConnect from '../../lib/db'
import ContentEntry from '../../lib/models/ContentEntry'

const BLOCKS = ['hero', 'about', 'contact']

const LABELS = {
  hero: 'Hero — Main headline or intro text',
  about: 'About — A short bio or company description',
  contact: 'Contact — Email, phone, or address info',
}

export default function ClientDashboard({ clientEmail, clientName, initialContent, viewerRole }) {
  const [content, setContent] = useState(initialContent)
  const [status, setStatus] = useState({})
  const router = useRouter()

  const handleSave = async (block) => {
    setStatus(s => ({ ...s, [block]: 'saving' }))
    const res = await fetch('/api/content/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ block, text: content[block] }),
    })
    if (res.ok) {
      setStatus(s => ({ ...s, [block]: 'saved' }))
      setTimeout(() => setStatus(s => ({ ...s, [block]: '' })), 2000)
    } else {
      setStatus(s => ({ ...s, [block]: 'error' }))
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '700px' }}>

      {/* Admin switcher banner — only visible when an admin is viewing this page */}
      {viewerRole === 'admin' && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #7dd3fc',
          borderRadius: '6px',
          padding: '0.6rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: '#0369a1', fontSize: '0.9rem', fontWeight: 500 }}>
            👁 Viewing as admin — changes here <em>are</em> saved.
          </span>
          <button
            onClick={() => router.push('/admin')}
            style={{
              background: '#0369a1',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '0.35rem 0.9rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              marginLeft: '1rem',
            }}
          >
            ← Back to Admin
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Welcome, {clientName || clientEmail}</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#666' }}>{clientEmail}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ padding: '0.4rem 1rem', cursor: 'pointer', background: '#eee', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          Log Out
        </button>
      </div>

      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Your Site Content</h2>

      {BLOCKS.map(block => (
        <div key={block} style={{ marginBottom: '2rem' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>
            {LABELS[block]}
          </label>
          <textarea
            rows={4}
            value={content[block] || ''}
            onChange={e => setContent(c => ({ ...c, [block]: e.target.value }))}
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.95rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          <button
            onClick={() => handleSave(block)}
            style={{ marginTop: '0.4rem', padding: '0.4rem 1.2rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {status[block] === 'saving' ? 'Saving...' : status[block] === 'saved' ? '✓ Saved' : status[block] === 'error' ? 'Error' : 'Save'}
          </button>
        </div>
      ))}
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)

  // Allow both admin and client roles to view this page
  if (!session || !['client', 'admin'].includes(session.user.role)) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  await dbConnect()

  const entries = await ContentEntry.find({ ownerEmail: session.user.email }).lean()

  const initialContent = {}
  BLOCKS.forEach(block => {
    const entry = entries.find(e => e.block === block)
    initialContent[block] = entry ? entry.text : ''
  })

  return {
    props: {
      clientEmail: session.user.email,
      clientName: session.user.name || null,
      initialContent,
      viewerRole: session.user.role,
    }
  }
}
