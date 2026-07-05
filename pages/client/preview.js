import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import { useRouter } from 'next/router'

const BLOCKS = ['hero', 'about', 'contact']

const LABELS = {
  hero: 'Hero — Main headline or intro text',
  about: 'About — A short bio or company description',
  contact: 'Contact — Email, phone, or address info',
}

const PLACEHOLDER = {
  hero: 'e.g. Welcome to Acme Co. — We build great things.',
  about: 'e.g. We are a small team passionate about quality and craft.',
  contact: 'e.g. hello@acmeco.com · +1 (555) 000-0000',
}

export default function ClientDashboardPreview() {
  const router = useRouter()

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>

      {/* Preview Banner */}
      <div style={{
        background: '#fffbeb',
        border: '1px solid #f59e0b',
        borderRadius: '6px',
        padding: '0.75rem 1.25rem',
        margin: '1.5rem 1.5rem 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: '#92400e', fontWeight: 600 }}>
          ⚠️ Preview Mode — This is how the client dashboard looks. Changes here are not saved.
        </span>
        <button
          onClick={() => router.push('/admin')}
          style={{
            background: '#f59e0b',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '0.35rem 0.9rem',
            cursor: 'pointer',
            fontWeight: 600,
            marginLeft: '1rem',
            whiteSpace: 'nowrap',
          }}
        >
          ← Exit Preview
        </button>
      </div>

      {/* Dashboard UI (mirrored, non-functional) */}
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: 0 }}>Welcome, Client Name</h1>
            <p style={{ margin: '0.25rem 0 0', color: '#666' }}>client@example.com</p>
          </div>
          <button
            disabled
            style={{ padding: '0.4rem 1rem', background: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: 'not-allowed', color: '#999' }}
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
              defaultValue={PLACEHOLDER[block]}
              readOnly
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '0.95rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                background: '#f9f9f9',
                color: '#555',
              }}
            />
            <button
              disabled
              style={{
                marginTop: '0.4rem',
                padding: '0.4rem 1.2rem',
                background: '#93c5fd',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'not-allowed',
              }}
            >
              Save
            </button>
          </div>
        ))}
      </div>
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
