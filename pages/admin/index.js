import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'

export default function AdminDashboard({ adminEmail }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {adminEmail}</p>
      <ul>
        <li><a href="/admin/clients">Manage Clients</a></li>
        <li>
          <a
            href="/client/preview"
            style={{ color: '#b45309' }}
          >
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
