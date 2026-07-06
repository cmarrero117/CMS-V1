import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'
import dbConnect from '../../../lib/db'
import User from '../../../lib/models/User'
import ContentEntry from '../../../lib/models/ContentEntry'

const BLOCKS = ['hero', 'about', 'contact']

const LABELS = {
  hero: 'Hero — Main headline or intro text',
  about: 'About — A short bio or company description',
  contact: 'Contact — Email, phone, or address info',
}

export default function ClientContentPage({ client, content }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '700px' }}>
      <Link href="/admin/clients" style={{ color: '#0070f3', fontSize: '0.875rem' }}>
        ← Back to All Clients
      </Link>

      <div style={{ marginTop: '1.5rem', marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h1 style={{ margin: '0 0 0.25rem' }}>{client.name || '(no name)'}</h1>
        <p style={{ margin: 0, color: '#666' }}>{client.email}</p>
      </div>

      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        Saved Site Content
      </h2>

      {BLOCKS.map(block => (
        <div key={block} style={{ marginBottom: '2rem' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 0.4rem' }}>{LABELS[block]}</p>
          {content[block] ? (
            <div style={{ padding: '0.75rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: '#222' }}>
              {content[block]}
            </div>
          ) : (
            <div style={{ padding: '0.75rem 1rem', background: '#fafafa', border: '1px dashed #ccc', borderRadius: '6px', color: '#999', fontStyle: 'italic', fontSize: '0.875rem' }}>
              Not filled in yet.
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const { id } = context.params

  await dbConnect()

  const user = await User.findById(id).select('-password').lean()
  if (!user || user.role !== 'client') {
    return { notFound: true }
  }

  const entries = await ContentEntry.find({ ownerEmail: user.email }).lean()

  const content = {}
  BLOCKS.forEach(block => {
    const entry = entries.find(e => e.block === block)
    content[block] = entry ? entry.text : ''
  })

  return {
    props: {
      client: {
        _id: user._id.toString(),
        name: user.name || null,
        email: user.email,
      },
      content,
    }
  }
}
