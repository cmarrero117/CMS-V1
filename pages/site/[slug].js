export default function PublicSite({ tenant, content, notFound }) {
  if (notFound) {
    return (
      <div style={{
        fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
        color: '#444', background: '#f9f9f9'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404</h1>
        <p>This site doesn't exist yet.</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', background: '#fff', minHeight: '100vh' }}>

      {/* Nav */}
      <header style={{
        borderBottom: '1px solid #e5e5e5',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <span style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
          {tenant.name}
        </span>
        <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
          <a href="#about" style={{ color: '#444', textDecoration: 'none' }}>About</a>
          <a href="#contact" style={{ color: '#444', textDecoration: 'none' }}>Contact</a>
        </nav>
      </header>

      {/* Hero */}
      <section style={{
        padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 6vw, 5rem)',
        maxWidth: '860px',
        margin: '0 auto',
      }}>
        {content.hero ? (
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '700',
            lineHeight: 1.15,
            margin: 0,
            color: '#111',
          }}>
            {content.hero}
          </h1>
        ) : (
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#bbb', fontStyle: 'italic', margin: 0 }}>
            Welcome to {tenant.name}
          </h1>
        )}
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 clamp(1.5rem, 6vw, 5rem)' }} />

      {/* About */}
      <section id="about" style={{
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1.5rem, 6vw, 5rem)',
        maxWidth: '860px',
        margin: '0 auto',
      }}>
        <h2 style={{ fontSize: '0.8rem', fontFamily: 'sans-serif', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', marginBottom: '1.5rem' }}>
          About
        </h2>
        {content.about ? (
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', lineHeight: 1.7, maxWidth: '65ch', margin: 0, color: '#333' }}>
            {content.about}
          </p>
        ) : (
          <p style={{ color: '#bbb', fontStyle: 'italic' }}>No about content yet.</p>
        )}
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 clamp(1.5rem, 6vw, 5rem)' }} />

      {/* Contact */}
      <section id="contact" style={{
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1.5rem, 6vw, 5rem)',
        maxWidth: '860px',
        margin: '0 auto',
      }}>
        <h2 style={{ fontSize: '0.8rem', fontFamily: 'sans-serif', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', marginBottom: '1.5rem' }}>
          Contact
        </h2>
        {content.contact ? (
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.7, maxWidth: '65ch', margin: 0, color: '#333' }}>
            {content.contact}
          </p>
        ) : (
          <p style={{ color: '#bbb', fontStyle: 'italic' }}>No contact info yet.</p>
        )}
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #eee',
        padding: '1.5rem clamp(1.5rem, 6vw, 5rem)',
        fontSize: '0.8rem',
        color: '#aaa',
        fontFamily: 'sans-serif',
        marginTop: '2rem',
      }}>
        {tenant.name} — Powered by CMS-V1
      </footer>
    </div>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  try {
    const res = await fetch(`${baseUrl}/api/site/${slug}`)
    if (res.status === 404) {
      return { props: { notFound: true, tenant: null, content: null } }
    }
    const data = await res.json()
    return { props: { notFound: false, tenant: data.tenant, content: data.content } }
  } catch (err) {
    return { props: { notFound: true, tenant: null, content: null } }
  }
}
