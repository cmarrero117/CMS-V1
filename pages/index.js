import { getServerSession } from 'next-auth/next'
import { authOptions } from '../lib/authOptions'
import dbConnect from '../lib/db'
import Tenant from '../lib/models/Tenant'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh', background: '#f8f8fb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '1.4rem', color: '#4f46e5', letterSpacing: '-0.5px' }}>Canvō</span>
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '2rem', marginTop: '1.5rem',
        }}>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', color: '#6b7280' }}>
            Multi-tenant site management platform.
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block', width: '100%', boxSizing: 'border-box',
              padding: '11px', background: '#4f46e5', color: '#fff',
              borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) return { props: {} }

  if (session.user.role === 'admin') {
    return { redirect: { destination: '/admin', permanent: false } }
  }

  if (session.user.role === 'client') {
    try {
      await dbConnect()
      const tenant = await Tenant.findById(session.user.tenantId).lean()
      if (tenant?.slug) {
        return { redirect: { destination: `/site/${tenant.slug}`, permanent: false } }
      }
    } catch (e) {
      console.error('Index redirect error:', e)
    }
    // Fallback to form dashboard if slug lookup fails
    return { redirect: { destination: '/client', permanent: false } }
  }

  return { props: {} }
}
