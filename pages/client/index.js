import { getSession } from 'next-auth/react'

export default function ClientDashboard({ session }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Client Dashboard</h1>
      <p>Welcome, {session?.user?.email}</p>
      <p>Your site content editor will appear here.</p>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context)
  if (!session || session.user.role !== 'client') {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: { session } }
}
