import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/authOptions'
import dbConnect from '../../../lib/db'
import User from '../../../lib/models/User'
import Tenant from '../../../lib/models/Tenant'
import SiteContent from '../../../lib/models/SiteContent'

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{label}</div>
      {value
        ? <div style={{ padding: '10px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{value}</div>
        : <div style={{ padding: '10px 12px', background: '#fafafa', border: '1px dashed #d1d5db', borderRadius: '8px', fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>Not filled in yet.</div>
      }
    </div>
  )
}

function SectionHeader({ title }) {
  return (
    <div style={{
      fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: '#6b7280',
      borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem',
      marginBottom: '1.25rem', marginTop: '0.25rem',
    }}>
      {title}
    </div>
  )
}

export default function ClientContentPage({ client, content, siteSlug, updatedAt }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const hasAnyContent = content && Object.values(content).some(v =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  )

  const handleViewAsClient = async () => {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client._id }),
      })
      if (res.ok) {
        router.push('/client')
      } else {
        const data = await res.json()
        setErr(data.error || 'Something went wrong.')
        setBusy(false)
      }
    } catch (e) {
      setErr('Network error.')
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* Top Nav */}
      <nav style={{
        background: '#ffffff', borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/admin" style={{ fontWeight: 700, fontSize: '1.2rem', color: '#4f46e5', letterSpacing: '-0.5px', textDecoration: 'none' }}>
          Canvō
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 14px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </nav>

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/admin" style={{ color: '#4f46e5', textDecoration: 'none' }}>Admin</Link>
          <span>›</span>
          <Link href="/admin/clients" style={{ color: '#4f46e5', textDecoration: 'none' }}>All Clients</Link>
          <span>›</span>
          <span style={{ color: '#374151', fontWeight: 500 }}>{client.name || client.email}</span>
        </div>

        {/* Client Header Card */}
        <div style={{
          background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '1.5rem', marginBottom: '1.75rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: '#ede9fe', color: '#4f46e5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.1rem', flexShrink: 0,
            }}>
              {(client.name || client.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{client.name || '(no name)'}</h1>
              <p style={{ margin: '0.15rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>{client.email}</p>
              {siteSlug && (
                <span style={{ display: 'inline-block', marginTop: '0.3rem', fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace', background: '#f3f4f6', padding: '1px 6px', borderRadius: '4px' }}>
                  /site/{siteSlug}
                </span>
              )}
              {updatedAt && (
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                  Last saved: {new Date(updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            {siteSlug && (
              <Link
                href={`/site/${siteSlug}`}
                target="_blank" rel="noopener noreferrer"
                style={{ padding: '8px 16px', background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
              >
                View Live Site ↗
              </Link>
            )}
            <button
              onClick={handleViewAsClient}
              disabled={busy}
              style={{
                padding: '8px 16px',
                background: busy ? '#e0e7ff' : '#4f46e5',
                color: busy ? '#6366f1' : '#fff',
                border: 'none', borderRadius: '8px',
                fontSize: '0.875rem', fontWeight: 500,
                cursor: busy ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Loading…' : '👁 View as Client →'}
            </button>
            {err && <div style={{ fontSize: '0.78rem', color: '#dc2626', textAlign: 'right' }}>{err}</div>}
          </div>
        </div>

        {/* No Content State */}
        {!hasAnyContent ? (
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '3rem', textAlign: 'center', color: '#6b7280',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📝</div>
            <p style={{ margin: 0, fontWeight: 500 }}>No content yet.</p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem' }}>This client hasn&apos;t saved any content yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Content Section */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
              <SectionHeader title="Content" />
              <Field label="Business Name"    value={content.businessName} />
              <Field label="Hero Headline"    value={content.heroHeadline} />
              <Field label="Hero Subheadline" value={content.heroSubheadline} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Hero Button Text" value={content.heroCtaText} />
                <Field label="Hero Button Link" value={content.heroCtaUrl} />
              </div>
              <Field label="About Text" value={content.aboutText} />

              {/* Services */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Services ({(content.services || []).length})
                </div>
                {(content.services || []).length === 0
                  ? <div style={{ padding: '10px 12px', background: '#fafafa', border: '1px dashed #d1d5db', borderRadius: '8px', fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>No services added yet.</div>
                  : (content.services || []).map((svc, i) => (
                      <div key={i} style={{ padding: '0.75rem 1rem', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', marginBottom: '0.2rem' }}>{svc.title || '(untitled)'}</div>
                        {svc.description && <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{svc.description}</div>}
                      </div>
                    ))
                }
              </div>
            </div>

            {/* Team Members */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
              <SectionHeader title={`Team Members (${(content.teamMembers || []).length})`} />
              {(content.teamMembers || []).length === 0
                ? <div style={{ padding: '10px 12px', background: '#fafafa', border: '1px dashed #d1d5db', borderRadius: '8px', fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>No team members added yet.</div>
                : (content.teamMembers || []).map((m, i) => (
                    <div key={i} style={{ padding: '0.75rem 1rem', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{m.name || '(no name)'}</div>
                      {m.title && <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.1rem' }}>{m.title}</div>}
                      {m.bio   && <div style={{ fontSize: '0.875rem', color: '#374151', marginTop: '0.3rem' }}>{m.bio}</div>}
                      {m.imageUrl && <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace', marginTop: '0.3rem' }}>{m.imageUrl}</div>}
                    </div>
                  ))
              }
            </div>

            {/* Testimonials */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
              <SectionHeader title={`Testimonials (${(content.testimonials || []).length})`} />
              {(content.testimonials || []).length === 0
                ? <div style={{ padding: '10px 12px', background: '#fafafa', border: '1px dashed #d1d5db', borderRadius: '8px', fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>No testimonials added yet.</div>
                : (content.testimonials || []).map((t, i) => (
                    <div key={i} style={{ padding: '0.75rem 1rem', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.5rem' }}>
                      {t.quote && <div style={{ fontSize: '0.875rem', color: '#374151', fontStyle: 'italic', marginBottom: '0.35rem' }}>&ldquo;{t.quote}&rdquo;</div>}
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{t.author || '(no author)'}</div>
                      {t.role && <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{t.role}</div>}
                    </div>
                  ))
              }
            </div>

            {/* Contact */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
              <SectionHeader title="Contact" />
              <Field label="Phone"   value={content.contactPhone} />
              <Field label="Email"   value={content.contactEmail} />
              <Field label="Address" value={content.contactAddress} />
            </div>

            {/* Media */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
              <SectionHeader title="Media URLs" />
              <Field label="Logo URL"       value={content.logoUrl} />
              <Field label="Hero Image URL" value={content.heroImageUrl} />
            </div>

            {/* SEO */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
              <SectionHeader title="SEO & Social" />
              <Field label="Page Title"               value={content.seoTitle} />
              <Field label="Meta Description"         value={content.seoDescription} />
              <Field label="Keywords"                 value={content.seoKeywords} />
              <Field label="Social Share Title"       value={content.ogTitle} />
              <Field label="Social Share Description" value={content.ogDescription} />
              <Field label="Social Share Image URL"   value={content.ogImageUrl} />
            </div>

          </div>
        )}
      </main>
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
  let content  = {}
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
          heroCtaText:     sc.heroCtaText     || '',
          heroCtaUrl:      sc.heroCtaUrl      || '',
          aboutText:       sc.aboutText       || '',
          services:        (sc.services     || []).map(s => ({ title: s.title || '', description: s.description || '' })),
          teamMembers:     (sc.teamMembers  || []).map(m => ({ name: m.name || '', title: m.title || '', bio: m.bio || '', imageUrl: m.imageUrl || '' })),
          testimonials:    (sc.testimonials || []).map(t => ({ quote: t.quote || '', author: t.author || '', role: t.role || '' })),
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
      client: { _id: user._id.toString(), name: user.name || null, email: user.email || null },
      siteSlug,
      content,
      updatedAt,
    }
  }
}
