import { signOut } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'

export default function AdminDashboard({ adminEmail }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>

      <p>Welcome, {adminEmail}</p>
      <ul>
        <li><a href="/admin/clients">Manage Clients</a></li>
        <li>
          <a href="/client/preview" style={{ color: '#b45309' }}>
            ⚠️ Preview Client Dashboard
          </a>
        </li>
      </ul>
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
