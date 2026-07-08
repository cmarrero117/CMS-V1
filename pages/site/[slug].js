import Head from 'next/head'
import dbConnect from '../../lib/db'
import SiteContent from '../../lib/models/SiteContent'
import Tenant from '../../lib/models/Tenant'

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  page:      { fontFamily: "'Georgia', serif", color: '#1a1a1a', background: '#fff', minHeight: '100vh' },
  nav:       { borderBottom: '1px solid #e5e5e5', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 10 },
  navBrand:  { fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em', textDecoration: 'none', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.6rem' },
  navLinks:  { display: 'flex', gap: '1.5rem', fontSize: '0.9rem' },
  navLink:   { color: '#444', textDecoration: 'none' },
  hero:      { padding: 'clamp(4rem,10vw,8rem) clamp(1.5rem,6vw,5rem)', maxWidth: '860px', margin: '0 auto' },
  h1:        { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 700, lineHeight: 1.15, margin: 0, color: '#111' },
  h1Empty:   { fontSize: 'clamp(2rem,5vw,3.5rem)', color: '#bbb', fontStyle: 'italic', margin: 0 },
  sub:       { marginTop: '1rem', fontSize: 'clamp(1rem,2vw,1.2rem)', color: '#555', lineHeight: 1.5, maxWidth: '60ch' },
  heroImg:   { width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block', marginTop: '2rem', borderRadius: '8px' },
  hr:        { border: 'none', borderTop: '1px solid #eee', margin: '0 clamp(1.5rem,6vw,5rem)' },
  section:   { padding: 'clamp(3rem,8vw,6rem) clamp(1.5rem,6vw,5rem)', maxWidth: '860px', margin: '0 auto' },
  eyebrow:   { fontSize: '0.78rem', fontFamily: 'sans-serif', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginBottom: '1.25rem' },
  body:      { fontSize: 'clamp(1rem,2vw,1.15rem)', lineHeight: 1.75, maxWidth: '65ch', margin: 0, color: '#333' },
  empty:     { color: '#bbb', fontStyle: 'italic', fontFamily: 'sans-serif' },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' },
  card:      { background: '#f9f9f9', borderRadius: '8px', padding: '1.25rem 1.5rem', border: '1px solid #eee' },
  cardTitle: { fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem', color: '#111' },
  cardDesc:  { fontSize: '0.9rem', color: '#555', lineHeight: 1.6, margin: 0 },
  contactRow:{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'sans-serif', fontSize: '0.95rem', color: '#333' },
  footer:    { borderTop: '1px solid #eee', padding: '1.5rem clamp(1.5rem,6vw,5rem)', fontSize: '0.8rem', color: '#aaa', fontFamily: 'sans-serif', marginTop: '2rem' },
  notFound:  { fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#444', background: '#f9f9f9' },
}

export default function PublicSite({ notFound, tenant, c }) {
  if (notFound || !tenant || !c) {
    return (
      <div style={S.notFound}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404</h1>
        <p>This site doesn’t exist yet.</p>
      </div>
    )
  }

  const siteName = c.businessName || tenant.name
  const pageTitle = c.seoTitle || siteName
  const pageDesc  = c.seoDescription || ''
  const ogTitle   = c.ogTitle || pageTitle
  const ogDesc    = c.ogDescription || pageDesc

  return (
    <>
      {/* ── SEO HEAD ──────────────────────────────────────────── */}
      <Head>
        <title>{pageTitle}</title>
        {pageDesc  && <meta name="description"      content={pageDesc} />}
        {c.seoKeywords && <meta name="keywords"     content={c.seoKeywords} />}
        <meta property="og:type"                    content="website" />
        <meta property="og:title"                   content={ogTitle} />
        {ogDesc    && <meta property="og:description" content={ogDesc} />}
        {c.ogImageUrl && <meta property="og:image"  content={c.ogImageUrl} />}
        <meta name="twitter:card"                   content="summary_large_image" />
        <meta name="twitter:title"                  content={ogTitle} />
        {ogDesc    && <meta name="twitter:description" content={ogDesc} />}
        {c.ogImageUrl && <meta name="twitter:image" content={c.ogImageUrl} />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={S.page}>

        {/* ── NAV ──────────────────────────────────────────────── */}
        <header style={S.nav}>
          <a href="#" style={S.navBrand}>
            {c.logoUrl && (
              <img src={c.logoUrl} alt={`${siteName} logo`} height="32" style={{ objectFit: 'contain' }} />
            )}
            {siteName}
          </a>
          <nav style={S.navLinks}>
            {(c.services || []).length > 0 && <a href="#services" style={S.navLink}>Services</a>}
            <a href="#about"   style={S.navLink}>About</a>
            <a href="#contact" style={S.navLink}>Contact</a>
          </nav>
        </header>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section style={S.hero}>
          {c.heroHeadline ? (
            <h1 style={S.h1}>{c.heroHeadline}</h1>
          ) : (
            <h1 style={S.h1Empty}>Welcome to {siteName}</h1>
          )}
          {c.heroSubheadline && <p style={S.sub}>{c.heroSubheadline}</p>}
          {c.heroImageUrl && (
            <img
              src={c.heroImageUrl}
              alt={`${siteName} hero image`}
              style={S.heroImg}
              loading="lazy"
            />
          )}
        </section>

        <hr style={S.hr} />

        {/* ── SERVICES ──────────────────────────────────────────── */}
        {(c.services || []).length > 0 && (
          <>
            <section id="services" style={S.section}>
              <h2 style={S.eyebrow}>Services</h2>
              <div style={S.grid}>
                {c.services.map((svc, i) => (
                  <div key={i} style={S.card}>
                    <p style={S.cardTitle}>{svc.title}</p>
                    {svc.description && <p style={S.cardDesc}>{svc.description}</p>}
                  </div>
                ))}
              </div>
            </section>
            <hr style={S.hr} />
          </>
        )}

        {/* ── ABOUT ─────────────────────────────────────────────── */}
        <section id="about" style={S.section}>
          <h2 style={S.eyebrow}>About</h2>
          {c.aboutText ? (
            <p style={S.body}>{c.aboutText}</p>
          ) : (
            <p style={S.empty}>No about content yet.</p>
          )}
        </section>

        <hr style={S.hr} />

        {/* ── CONTACT ────────────────────────────────────────────── */}
        <section id="contact" style={S.section}>
          <h2 style={S.eyebrow}>Contact</h2>
          {(c.contactPhone || c.contactEmail || c.contactAddress) ? (
            <div style={S.contactRow}>
              {c.contactPhone   && <span>📞 {c.contactPhone}</span>}
              {c.contactEmail   && <span>✉️ {c.contactEmail}</span>}
              {c.contactAddress && <span>📍 {c.contactAddress}</span>}
            </div>
          ) : (
            <p style={S.empty}>No contact info yet.</p>
          )}
        </section>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <footer style={S.footer}>
          {siteName} — Powered by CMS-V1
        </footer>

      </div>
    </>
  )
}

// ─── Server-side data fetch ───────────────────────────────────────────────────
export async function getServerSideProps(context) {
  const { slug } = context.params

  try {
    await dbConnect()

    const tenant = await Tenant.findOne({ slug }).lean()
    if (!tenant) return { props: { notFound: true, tenant: null, c: null } }

    const raw = await SiteContent.findOne({ tenantId: tenant._id }).lean()

    // Serialize — strip ObjectIds/Dates for Next.js props
    const c = raw ? {
      businessName:    raw.businessName    || '',
      heroHeadline:    raw.heroHeadline    || '',
      heroSubheadline: raw.heroSubheadline || '',
      aboutText:       raw.aboutText       || '',
      services:        (raw.services || []).map(s => ({ title: s.title || '', description: s.description || '' })),
      contactPhone:    raw.contactPhone    || '',
      contactEmail:    raw.contactEmail    || '',
      contactAddress:  raw.contactAddress  || '',
      logoUrl:         raw.logoUrl         || '',
      heroImageUrl:    raw.heroImageUrl    || '',
      seoTitle:        raw.seoTitle        || '',
      seoDescription:  raw.seoDescription  || '',
      seoKeywords:     raw.seoKeywords     || '',
      ogTitle:         raw.ogTitle         || '',
      ogDescription:   raw.ogDescription   || '',
      ogImageUrl:      raw.ogImageUrl      || '',
    } : {}

    return {
      props: {
        notFound: false,
        tenant: { name: tenant.name, slug: tenant.slug },
        c,
      }
    }
  } catch (err) {
    console.error('PublicSite error:', err.message)
    return { props: { notFound: true, tenant: null, c: null } }
  }
}
