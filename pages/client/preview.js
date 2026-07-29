import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import { useRouter } from 'next/router'

const inp = {
  width: '100%', padding: '10px 12px', fontSize: '0.9rem',
  borderRadius: '8px', border: '1px solid #e5e7eb',
  boxSizing: 'border-box', background: '#f3f4f6', color: '#6b7280',
  cursor: 'not-allowed', outline: 'none',
}
const ta = { ...inp, resize: 'vertical' }

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

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem', color: '#374151' }}>{label}</label>
      {hint && <span style={{ display: 'block', fontSize: '0.76rem', color: '#9ca3af', marginBottom: '0.4rem' }}>{hint}</span>}
      {children}
    </div>
  )
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.75rem', marginBottom: '1.25rem' }}>
      <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{title}</h2>
        {subtitle && <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export default function ClientDashboardPreview() {
  const router = useRouter()
  const f = DEMO
  const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }
  const itemBox = { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem 1.1rem', marginBottom: '0.75rem' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* Top Nav */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#4f46e5', letterSpacing: '-0.5px' }}>Canvō</span>
        <button
          disabled
          style={{ background: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 14px', fontSize: '0.875rem', fontWeight: 500, cursor: 'not-allowed' }}
        >
          Log Out
        </button>
      </nav>

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 2rem 6rem' }}>

        {/* Admin Preview Banner */}
        <div style={{
          background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '10px',
          padding: '0.75rem 1.1rem', marginBottom: '1.75rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
        }}>
          <span style={{ color: '#92400e', fontWeight: 600, fontSize: '0.875rem' }}>
            ⚠️ Preview Mode — This is how the client dashboard looks. Changes here are not saved.
          </span>
          <button
            onClick={() => router.push('/admin')}
            style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            ← Exit Preview
          </button>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>Welcome, {f.businessName || 'Client Name'}</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#6b7280' }}>Edit your site content below. Changes go live as soon as you save.</p>
        </div>

        {/* CONTENT */}
        <SectionCard title="Content" subtitle="Core text that appears throughout your public website.">
          <Field label="Business Name" hint="Your official business name — appears in the nav, footer, and page title.">
            <input readOnly style={inp} value={f.businessName} />
          </Field>
          <Field label="Hero Headline" hint="The large heading visitors see first. Keep it short and clear.">
            <input readOnly style={inp} value={f.heroHeadline} />
          </Field>
          <Field label="Hero Subheadline" hint="One sentence below the headline. Optional but recommended.">
            <input readOnly style={inp} value={f.heroSubheadline} />
          </Field>
          <div style={twoCol}>
            <Field label="Hero Button Text" hint="Text on the call-to-action button.">
              <input readOnly style={inp} value="Book an Appointment" />
            </Field>
            <Field label="Hero Button Link" hint="URL the button points to.">
              <input readOnly style={inp} value="/contact" />
            </Field>
          </div>
          <Field label="About Text" hint="A short paragraph describing your practice, business, or background.">
            <textarea readOnly style={ta} rows={4} value={f.aboutText} />
          </Field>

          {/* Services */}
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: '0.2rem' }}>Services <span style={{ fontWeight: 400, color: '#9ca3af' }}>(up to 6)</span></label>
            <span style={{ display: 'block', fontSize: '0.76rem', color: '#9ca3af', marginBottom: '0.75rem' }}>List the main services you offer. Each one gets a title and a short description.</span>
            {f.services.map((svc, i) => (
              <div key={i} style={itemBox}>
                <input readOnly style={{ ...inp, marginBottom: '0.5rem', width: '100%' }} value={svc.title} />
                <textarea readOnly style={ta} rows={2} value={svc.description} />
              </div>
            ))}
            <button disabled style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af', cursor: 'not-allowed' }}>+ Add Service</button>
          </div>
        </SectionCard>

        {/* CONTACT */}
        <SectionCard title="Contact" subtitle="Your publicly displayed contact information.">
          <Field label="Phone" hint="">
            <input readOnly style={inp} value={f.contactPhone} />
          </Field>
          <Field label="Email" hint="">
            <input readOnly style={inp} value={f.contactEmail} />
          </Field>
          <Field label="Address" hint="">
            <input readOnly style={inp} value={f.contactAddress} />
          </Field>
        </SectionCard>

        {/* MEDIA */}
        <SectionCard title="Media" subtitle="Image URLs for your logo and hero background.">
          <Field label="Logo URL" hint="Paste the URL of your logo image. Leave blank to use the default.">
            <input readOnly style={inp} value={f.logoUrl || ''} placeholder="https://..." />
          </Field>
          <Field label="Hero Image URL" hint="Background or banner photo for the hero section.">
            <input readOnly style={inp} value={f.heroImageUrl || ''} placeholder="https://..." />
          </Field>
        </SectionCard>

        {/* SEO */}
        <SectionCard title="SEO & Social" subtitle="Controls how your site appears in Google and social media previews.">
          <Field label="Page Title" hint="Shows in the browser tab and Google results. Ideal: 50–60 characters.">
            <input readOnly style={inp} value={f.seoTitle} />
          </Field>
          <Field label="Meta Description" hint="Shown under your link in Google. Ideal: 150–160 characters.">
            <textarea readOnly style={ta} rows={3} value={f.seoDescription} />
          </Field>
          <Field label="Keywords" hint="Comma-separated words related to your business.">
            <input readOnly style={inp} value={f.seoKeywords} />
          </Field>
          <Field label="Social Share Title" hint="Shown when your site is shared on Facebook, WhatsApp, etc.">
            <input readOnly style={inp} value={f.ogTitle} />
          </Field>
          <Field label="Social Share Description" hint="Description in social share previews.">
            <textarea readOnly style={ta} rows={2} value={f.ogDescription} />
          </Field>
          <Field label="Social Share Image URL" hint="Recommended size: 1200 × 630px.">
            <input readOnly style={inp} value={f.ogImageUrl || ''} placeholder="https://..." />
          </Field>
        </SectionCard>

      </main>

      {/* Sticky Save Bar (disabled in preview) */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem',
        zIndex: 50,
      }}>
        <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Preview only — nothing is saved here.</span>
        <button
          disabled
          style={{ padding: '10px 28px', background: '#d1d5db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: 'not-allowed' }}
        >
          Save All Changes
        </button>
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
