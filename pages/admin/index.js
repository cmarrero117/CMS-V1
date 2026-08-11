import { signOut } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'

export default function AdminDashboard({ adminEmail }) {
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
        <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#4f46e5', letterSpacing: '-0.5px' }}>
          Canvō
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{adminEmail}</span>
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
        </div>
      </nav>

      {/* Page Content */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>Admin Dashboard</h1>
          <p style={{ margin: '0.35rem 0 0', color: '#6b7280', fontSize: '0.95rem' }}>Welcome back. Manage your clients and their sites from here.</p>
        </div>

        {/* Quick Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>

          {/* Manage Clients Card */}
          <a href="/admin/clients" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.10)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem', fontSize: '1.25rem'
              }}>👥</div>
              <h2 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Manage Clients</h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>View, edit, and delete client accounts and their site content.</p>
              <span style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.875rem', color: '#4f46e5', fontWeight: 500 }}>Go to Clients →</span>
            </div>
          </a>

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
  return {
    props: {
      adminEmail: session.user.email ?? null,
    }
  }
}
