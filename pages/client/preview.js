import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import { useRouter } from 'next/router'

// ─── Styles (mirrored from client/index.js) ───────────────────────────────────
const s = {
  page:        { fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '780px', margin: '0 auto', color: '#1a1a1a' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  name:        { margin: 0, fontSize: '1.6rem', fontWeight: 700 },
  email:       { margin: '0.2rem 0 0', color: '#666', fontSize: '0.9rem' },
  logoutBtn:   { padding: '0.4rem 1rem', background: '#eee', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.9rem', cursor: 'not-allowed', color: '#999' },
  section:     { marginBottom: '2.5rem' },
  sectionHead: { fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.25rem' },
  input:       { width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.95rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', background: '#f9f9f9', color: '#555' },
  textarea:    { width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.95rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', resize: 'vertical', background: '#f9f9f9', color: '#555' },
  serviceBox:  { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' },
  saveBar:     { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' },
  saveBtn:     { padding: '0.55rem 1.5rem', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'not-allowed', fontWeight: 600, fontSize: '0.95rem' },
  addBtn:      { padding: '0.4rem 1rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, cursor: 'not-allowed', color: '#9ca3af' },
  banner:      { background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '6px', padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  bannerText:  { color: '#92400e', fontWeight: 600 },
  exitBtn:     { background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.35rem 0.9rem', cursor: 'pointer', fontWeight: 600, marginLeft: '1rem', whiteSpace: 'nowrap' },
}

// ─── Placeholder content shown in preview ────────────────────────────────────
const DEMO = {
  businessName:    'Acme Co.',
  heroHeadline:    'We build great things.',
  heroSubheadline: 'Serving clients worldwide since 2010.',
  aboutText:       'We are a small team passionate about quality and craft. Our mission is to deliver exceptional results for every client we work with.',
  services: [
    { title: 'Web Design',     description: 'Beautiful, responsive websites tailored to your brand.' },
    { title: 'SEO Consulting', description: 'Data-driven strategies to grow your organic search presence.' },
  ],
  contactPhone:   '(555) 000-0000',
  contactEmail:   'hello@acmeco.com',
  contactAddress: '123 Main St, Anytown, USA',
  logoUrl:        '',
  heroImageUrl:   '',
  seoTitle:       'Acme Co. — We Build Great Things',
  seoDescription: 'Acme Co. delivers top-quality web and digital services for businesses of all sizes.',
  seoKeywords:    'web design, SEO, digital marketing',
  ogTitle:        'Acme Co.',
  ogDescription:  'Quality web and digital services.',
  ogImageUrl:     '',
}

// ─── Read-only Field helper ───────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: '#374151' }}>{label}</label>
      {hint && <span style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.4rem' }}>{hint}</span>}
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ClientDashboardPreview() {
  const router = useRouter()
  const f = DEMO

  return (
    <div style={s.page}>

      {/* Preview Banner */}
      <div style={s.banner}>
        <span style={s.bannerText}>
          ⚠️ Preview Mode — This is how the client dashboard looks. Changes here are not saved.
        </span>
        <button style={s.exitBtn} onClick={() => router.push('/admin')}>
          ← Exit Preview
        </button>
      </div>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.name}>Welcome, {f.businessName || 'Client Name'}</h1>
          <p style={s.email}>client@example.com</p>
        </div>
        <button disabled style={s.logoutBtn}>Log Out</button>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────── */}
      <div style={s.section}>
        <h2 style={s.sectionHead}>Content</h2>

        <Field label="Business Name" hint="Your official business name — appears in the nav, footer, and page title.">
          <input readOnly style={s.input} value={f.businessName} />
        </Field>

        <Field label="Hero Headline" hint="The large heading visitors see first. Keep it short and clear.">
          <input readOnly style={s.input} value={f.heroHeadline} />
        </Field>

        <Field label="Hero Subheadline" hint="One sentence below the headline. Optional but recommended.">
          <input readOnly style={s.input} value={f.heroSubheadline} />
        </Field>

        <Field label="About Text" hint="A short paragraph describing your practice, business, or background.">
          <textarea readOnly style={s.textarea} rows={4} value={f.aboutText} />
        </Field>

        {/* Services */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: '#374151' }}>
            Services <span style={{ fontWeight: 400, color: '#9ca3af' }}>(up to 6)</span>
          </label>
          <span style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
            List the main services you offer. Each one gets a title and a short description.
          </span>
          {f.services.map((svc, i) => (
            <div key={i} style={s.serviceBox}>
              <input readOnly style={{ ...s.input, marginBottom: '0.5rem' }} value={svc.title} />
              <textarea readOnly style={s.textarea} rows={2} value={svc.description} />
            </div>
          ))}
          <button disabled style={s.addBtn}>+ Add Service</button>
        </div>

        <Field label="Contact Phone" hint=""><input readOnly style={s.input} value={f.contactPhone} /></Field>
        <Field label="Contact Email" hint=""><input readOnly style={s.input} value={f.contactEmail} /></Field>
        <Field label="Contact Address" hint=""><input readOnly style={s.input} value={f.contactAddress} /></Field>
        <Field label="Logo URL" hint="Paste the URL of your logo image. Leave blank to use the default.">
          <input readOnly style={s.input} value={f.logoUrl || ''} placeholder="https://..." />
        </Field>
        <Field label="Hero Image URL" hint="Background or banner photo for the hero section. Leave blank to use the default.">
          <input readOnly style={s.input} value={f.heroImageUrl || ''} placeholder="https://..." />
        </Field>
      </div>

      {/* ── SEO ──────────────────────────────────────────────────── */}
      <div style={s.section}>
        <h2 style={s.sectionHead}>SEO &amp; Social</h2>

        <Field label="Page Title" hint="Shows in the browser tab and Google search results. Ideal length: 50–60 characters.">
          <input readOnly style={s.input} value={f.seoTitle} />
        </Field>
        <Field label="Meta Description" hint="The snippet shown under your link in Google. Ideal length: 150–160 characters.">
          <textarea readOnly style={s.textarea} rows={3} value={f.seoDescription} />
        </Field>
        <Field label="Keywords" hint="Comma-separated words related to your business.">
          <input readOnly style={s.input} value={f.seoKeywords} />
        </Field>
        <Field label="Social Share Title" hint="Title shown when someone shares your site on Facebook, WhatsApp, etc.">
          <input readOnly style={s.input} value={f.ogTitle} />
        </Field>
        <Field label="Social Share Description" hint="Description shown in social share previews.">
          <textarea readOnly style={s.textarea} rows={2} value={f.ogDescription} />
        </Field>
        <Field label="Social Share Image URL" hint="Image shown when your site is shared on social media. Recommended size: 1200 × 630px.">
          <input readOnly style={s.input} value={f.ogImageUrl || ''} placeholder="https://..." />
        </Field>
      </div>

      {/* ── SAVE BAR (disabled) ───────────────────────────────────── */}
      <div style={s.saveBar}>
        <button disabled style={s.saveBtn}>Save All Changes</button>
        <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Preview only — nothing is saved here.</span>
      </div>

    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}
