import { getServerSession } from 'next-auth/next'
import { authOptions } from '../lib/authOptions'
import dbConnect from '../lib/db'
import Tenant from '../lib/models/Tenant'

export default function Home() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>CMS-V1</h1>
      <p>Platform is running. <a href="/login">Log in</a> to continue.</p>
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
