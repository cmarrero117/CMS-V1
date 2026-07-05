import { getSession } from 'next-auth/react'

export default function ClientsPage({ clients }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>All Clients</h1>
      {clients.length === 0 && <p>No clients yet.</p>}
      <ul>
        {clients.map(c => (
          <li key={c._id}>{c.name} — {c.email} — <a href={`/admin/clients/${c.slug}`}>Manage</a></li>
        ))}
      </ul>
      <a href="/admin/clients/new">+ Add New Client</a>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context)
  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login', permanent: false } }
  }
  // Will fetch from DB in next step
  return { props: { clients: [] } }
}
