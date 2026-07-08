import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'
import dbConnect from '../../../lib/db'
import User from '../../../lib/models/User'
import Tenant from '../../../lib/models/Tenant'
import SiteContent from '../../../lib/models/SiteContent'

const s = {
  page:       { fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '760px', color: '#1a1a1a' },
  nav:        { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem', fontSize: '0.875rem', flexWrap: 'wrap' },
  navLink:    { color: '#0070f3', textDecoration: 'none' },
  sep:        { color: '#ccc' },
  card:       { background: '#f5f5f5', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' },
  clientName: { margin: '0 0 0.2rem', fontSize: '1.4rem', fontWeight: 700 },
  clientMeta: { margin: 0, color: '#666', fontSize: '0.9rem' },
  slugBadge:  { margin: '0.3rem 0 0', fontSize: '0.78rem', color: '#999', fontFamily: 'monospace' },
  liveBtn:    { display: 'inline-block', padding: '0.4rem 0.9rem', background: '#16a34a', color: '#fff', borderRadius: '5px', textDecoration: 'none', fontSize: '0.875rem' },
  section:    { marginBottom: '2rem' },
  sectionH:   { fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.4rem', marginBottom: '1rem' },
  row:        { marginBottom: '1rem' },
  fieldLabel: { fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' },
  value:      { padding: '0.6rem 0.85rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.9rem', color: '#111', whiteSpace: 'pre-wrap', lineHeight: 1.55 },
  empty:      { padding: '0.6rem 0.85rem', background: '#fafafa', border: '1px dashed #d1d5db', borderRadius: '6px', fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' },
  svcBox:     { padding: '0.6rem 0.85rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '0.5rem' },
  svcTitle:   { fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' },
  svcDesc:    { fontSize: '0.875rem', color: '#555' },
  noContent:  { padding: '3rem 0', textAlign: 'center', color: '#9ca3af', fontSize: '0.95rem' },
  ts:         { marginTop: '0.5rem', fontSize: '0.78rem', color: '#9ca3af' },
}

function Field({ label, value }) {
  return (
    <div style={s.row}>
      <div style={s.fieldLabel}>{label}</div>
      {value
        ? <div style={s.value}>{value}</div>
        : <div style={s.empty}>Not filled in yet.</div>
      }
    </div>
  )
}

export default function ClientContentPage({ client, content, siteSlug, updatedAt }) {
  const hasAnyContent = content && Object.values(content).some(v =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  )

  return (
    <div style={s.page}>

      {/* Breadcrumb */}
      <div style={s.nav}>
        <Link href="/admin" style={s.navLink}>← Admin</Link>
        <span style={s.sep}>›</span>
        <Link href="/admin/clients" style={s.navLink}>All Clients</Link>
        <span style={s.sep}>›</span>
        <span style={{ color: '#374151' }}>{client.name || client.email}</span>
      </div>

      {/* Client card */}
      <div style={s.card}>
        <div>
          <h1 style={s.clientName}>{client.name || '(no name)'}</h1>
          <p style={s.clientMeta}>{client.email}</p>
          {siteSlug && <p style={s.slugBadge}>/site/{siteSlug}</p>}
          {updatedAt && <p style={s.ts}>Last saved: {new Date(updatedAt).toLocaleString()}</p>}
        </div>
        {siteSlug && (
          <Link href={`/site/${siteSlug}`} target="_blank" rel="noopener noreferrer" style={s.liveBtn}>
            View Live Site ↗
          </Link>
        )}
      </div>

      {!hasAnyContent ? (
        <div style={s.noContent}>
          This client hasn&apos;t saved any content yet.
        </div>
      ) : (
        <>
          {/* ── CONTENT ── */}
          <div style={s.section}>
            <div style={s.sectionH}>Content</div>
            <Field label="Business Name"    value={content.businessName} />
            <Field label="Hero Headline"    value={content.heroHeadline} />
            <Field label="Hero Subheadline" value={content.heroSubheadline} />
            <Field label="About Text"       value={content.aboutText} />

            {/* Services */}
            <div style={s.row}>
              <div style={s.fieldLabel}>Services ({(content.services || []).length})</div>
              {(content.services || []).length === 0
                ? <div style={s.empty}>No services added yet.</div>
                : (content.services || []).map((svc, i) => (
                    <div key={i} style={s.svcBox}>
                      <div style={s.svcTitle}>{svc.title || '(untitled)'}</div>
                      {svc.description && <div style={s.svcDesc}>{svc.description}</div>}
                    </div>
                  ))
              }
            </div>
          </div>

          {/* ── CONTACT ── */}
          <div style={s.section}>
            <div style={s.sectionH}>Contact</div>
            <Field label="Phone"   value={content.contactPhone} />
            <Field label="Email"   value={content.contactEmail} />
            <Field label="Address" value={content.contactAddress} />
          </div>

          {/* ── MEDIA ── */}
          <div style={s.section}>
            <div style={s.sectionH}>Media URLs</div>
            <Field label="Logo URL"       value={content.logoUrl} />
            <Field label="Hero Image URL" value={content.heroImageUrl} />
          </div>

          {/* ── SEO ── */}
          <div style={s.section}>
            <div style={s.sectionH}>SEO &amp; Social</div>
            <Field label="Page Title"              value={content.seoTitle} />
            <Field label="Meta Description"        value={content.seoDescription} />
            <Field label="Keywords"                value={content.seoKeywords} />
            <Field label="Social Share Title"      value={content.ogTitle} />
            <Field label="Social Share Description" value={content.ogDescription} />
            <Field label="Social Share Image URL"  value={content.ogImageUrl} />
          </div>
        </>
      )}
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const { id } = context.params

  await dbConnect()

  const user = await User.findById(id).select('-password').lean()
  if (!user || user.role !== 'client') return { notFound: true }

  let siteSlug = null
  let content = {}
  let updatedAt = null

  if (user.tenantId) {
    const tenant = await Tenant.findById(user.tenantId).lean()
    if (tenant) {
      siteSlug = tenant.slug
      const sc = await SiteContent.findOne({ tenantId: tenant._id }).lean()
      if (sc) {
        content = {
          businessName:    sc.businessName    || '',
          heroHeadline:    sc.heroHeadline    || '',
          heroSubheadline: sc.heroSubheadline || '',
          aboutText:       sc.aboutText       || '',
          services:        (sc.services || []).map(s => ({ title: s.title || '', description: s.description || '' })),
          contactPhone:    sc.contactPhone    || '',
          contactEmail:    sc.contactEmail    || '',
          contactAddress:  sc.contactAddress  || '',
          logoUrl:         sc.logoUrl         || '',
          heroImageUrl:    sc.heroImageUrl    || '',
          seoTitle:        sc.seoTitle        || '',
          seoDescription:  sc.seoDescription  || '',
          seoKeywords:     sc.seoKeywords     || '',
          ogTitle:         sc.ogTitle         || '',
          ogDescription:   sc.ogDescription   || '',
          ogImageUrl:      sc.ogImageUrl      || '',
        }
        updatedAt = sc.updatedAt ? sc.updatedAt.toISOString() : null
      }
    }
  }

  return {
    props: {
      client: {
        _id:   user._id.toString(),
        name:  user.name  || null,
        email: user.email || null,
      },
      siteSlug,
      content,
      updatedAt,
    }
  }
}
