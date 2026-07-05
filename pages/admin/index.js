import { getSession } from 'next-auth/react'

export default function AdminDashboard({ session }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session?.user?.email}</p>
      <ul>
        <li><a href="/admin/clients">Manage Clients</a></li>
      </ul>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context)
  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: { session } }
}
