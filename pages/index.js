import { getSession } from 'next-auth/react'

export default function Home() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>CMS-V1</h1>
      <p>Platform is running. <a href="/login">Log in</a> to continue.</p>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession(context)
  if (session) {
    const dest = session.user.role === 'admin' ? '/admin' : '/client'
    return { redirect: { destination: dest, permanent: false } }
  }
  return { props: {} }
}
