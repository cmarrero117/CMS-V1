import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import dbConnect from '../../lib/db'
import SiteContent from '../../lib/models/SiteContent'
import Tenant from '../../lib/models/Tenant'

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = {
  page:        { fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '780px', margin: '0 auto', color: '#1a1a1a' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  name:        { margin: 0, fontSize: '1.6rem', fontWeight: 700 },
  email:       { margin: '0.2rem 0 0', color: '#666', fontSize: '0.9rem' },
  logoutBtn:   { padding: '0.4rem 1rem', cursor: 'pointer', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' },
  adminBanner: { background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  adminText:   { color: '#1d4ed8', fontSize: '0.9rem', fontWeight: 500 },
  backBtn:     { background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '5px', padding: '0.35rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  section:     { marginBottom: '2.5rem' },
  sectionHead: { fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.25rem' },
  field:       { marginBottom: '1.25rem' },
  label:       { display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem', color: '#374151' },
  hint:        { display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.4rem' },
  input:       { width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.95rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', background: '#fff' },
  textarea:    { width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.95rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box', resize: 'vertical', background: '#fff' },
  saveBar:     { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' },
  saveBtn:     { padding: '0.55rem 1.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' },
  savedMsg:    { fontSize: '0.88rem', color: '#16a34a', fontWeight: 500 },
  errorMsg:    { fontSize: '0.88rem', color: '#dc2626', fontWeight: 500 },
  serviceBox:  { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' },
  serviceRow:  { display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' },
  addBtn:      { padding: '0.4rem 1rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 },
  removeBtn:   { padding: '0.3rem 0.6rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 },
}

export default function ClientDashboard({ clientEmail, clientName, siteSlug, initialContent, viewerRole }) {
  const router = useRouter()

  const [form, setForm] = useState(initialContent)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const setService = (i, key, val) => {
    const updated = [...(form.services || [])]
    updated[i] = { ...updated[i], [key]: val }
    setForm(f => ({ ...f, services: updated }))
  }

  const addService = () => {
    if ((form.services || []).length >= 6) return
    setForm(f => ({ ...f, services: [...(f.services || []), { title: '', description: '' }] }))
  }

  const removeService = (i) => {
    const updated = [...(form.services || [])]
    updated.splice(i, 1)
    setForm(f => ({ ...f, services: updated }))
  }

  const handleSaveAll = async () => {
    setSaveState('saving')
    try {
      const res = await fetch(`/api/site-content/${siteSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 3000)
      } else {
        const err = await res.json()
        console.error(err)
        setSaveState('error')
      }
    } catch (e) {
      console.error(e)
      setSaveState('error')
    }
  }

  return (
    <div style={s.page}>

      {/* Admin banner */}
      {viewerRole === 'admin' && (
        <div style={s.adminBanner}>
          <span style={s.adminText}>👁 Viewing as admin — changes here <em>are</em> saved.</span>
          <button style={s.backBtn} onClick={() => router.push('/admin')}>← Back to Admin</button>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.name}>Welcome, {clientName || clientEmail}</h1>
          <p style={s.email}>{clientEmail}</p>
        </div>
        <button style={s.logoutBtn} onClick={() => signOut({ callbackUrl: '/login' })}>Log Out</button>
      </div>

      {/* ── CONTENT SECTION ───────────────────────────────────────── */}
      <div style={s.section}>
        <h2 style={s.sectionHead}>Content</h2>

        <Field label="Business Name" hint="Your official business name — appears in the nav, footer, and page title.">
          <input style={s.input} value={form.businessName || ''} onChange={e => set('businessName', e.target.value)} placeholder="e.g. Apex Pain Clinic" />
        </Field>

        <Field label="Hero Headline" hint="The large heading visitors see first. Keep it short and clear.">
          <input style={s.input} value={form.heroHeadline || ''} onChange={e => set('heroHeadline', e.target.value)} placeholder="e.g. Expert Pain Management Care" />
        </Field>

        <Field label="Hero Subheadline" hint="One sentence below the headline. Optional but recommended.">
          <input style={s.input} value={form.heroSubheadline || ''} onChange={e => set('heroSubheadline', e.target.value)} placeholder="e.g. Serving Puerto Rico since 2010" />
        </Field>

        <Field label="About Text" hint="A short paragraph describing your practice, business, or background.">
          <textarea style={s.textarea} rows={4} value={form.aboutText || ''} onChange={e => set('aboutText', e.target.value)} placeholder="e.g. We are a team of specialists dedicated to..." />
        </Field>

        {/* Services */}
        <div style={s.field}>
          <label style={s.label}>Services <span style={{ fontWeight: 400, color: '#9ca3af' }}>(up to 6)</span></label>
          <span style={s.hint}>List the main services you offer. Each one gets a title and a short description.</span>
          {(form.services || []).map((svc, i) => (
            <div key={i} style={s.serviceBox}>
              <div style={s.serviceRow}>
                <input
                  style={{ ...s.input, flex: 1 }}
                  value={svc.title || ''}
                  onChange={e => setService(i, 'title', e.target.value)}
                  placeholder={`Service ${i + 1} title — e.g. Physical Therapy`}
                />
                <button style={s.removeBtn} onClick={() => removeService(i)}>✕ Remove</button>
              </div>
              <textarea
                style={{ ...s.textarea, marginTop: 0 }}
                rows={2}
                value={svc.description || ''}
                onChange={e => setService(i, 'description', e.target.value)}
                placeholder="Short description of this service..."
              />
            </div>
          ))}
          {(form.services || []).length < 6 && (
            <button style={s.addBtn} onClick={addService}>+ Add Service</button>
          )}
        </div>

        <Field label="Contact Phone" hint="">
          <input style={s.input} value={form.contactPhone || ''} onChange={e => set('contactPhone', e.target.value)} placeholder="e.g. (787) 555-0100" />
        </Field>

        <Field label="Contact Email" hint="">
          <input style={s.input} value={form.contactEmail || ''} onChange={e => set('contactEmail', e.target.value)} placeholder="e.g. hello@apexpain.com" />
        </Field>

        <Field label="Contact Address" hint="">
          <input style={s.input} value={form.contactAddress || ''} onChange={e => set('contactAddress', e.target.value)} placeholder="e.g. 123 Main St, San Juan, PR 00901" />
        </Field>

        <Field label="Logo URL" hint="Paste the URL of your logo image. Leave blank to use the default.">
          <input style={s.input} value={form.logoUrl || ''} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." />
        </Field>

        <Field label="Hero Image URL" hint="Background or banner photo for the hero section. Leave blank to use the default.">
          <input style={s.input} value={form.heroImageUrl || ''} onChange={e => set('heroImageUrl', e.target.value)} placeholder="https://..." />
        </Field>
      </div>

      {/* ── SEO SECTION ───────────────────────────────────────────── */}
      <div style={s.section}>
        <h2 style={s.sectionHead}>SEO &amp; Social</h2>

        <Field label="Page Title" hint="Shows in the browser tab and Google search results. Ideal length: 50–60 characters.">
          <input style={s.input} value={form.seoTitle || ''} onChange={e => set('seoTitle', e.target.value)} placeholder="e.g. Apex Pain Clinic — Pain Management in Puerto Rico" />
        </Field>

        <Field label="Meta Description" hint="The snippet shown under your link in Google. Ideal length: 150–160 characters.">
          <textarea style={s.textarea} rows={3} value={form.seoDescription || ''} onChange={e => set('seoDescription', e.target.value)} placeholder="e.g. Apex Pain Clinic offers expert, compassionate pain management care in Puerto Rico. Call us today." />
        </Field>

        <Field label="Keywords" hint="Comma-separated words related to your business. Helps with search visibility.">
          <input style={s.input} value={form.seoKeywords || ''} onChange={e => set('seoKeywords', e.target.value)} placeholder="e.g. pain clinic, Puerto Rico, pain management, sports injury" />
        </Field>

        <Field label="Social Share Title" hint="Title shown when someone shares your site on Facebook, WhatsApp, etc. Defaults to Page Title if left blank.">
          <input style={s.input} value={form.ogTitle || ''} onChange={e => set('ogTitle', e.target.value)} placeholder="e.g. Apex Pain Clinic" />
        </Field>

        <Field label="Social Share Description" hint="Description shown in social share previews. Defaults to Meta Description if left blank.">
          <textarea style={s.textarea} rows={2} value={form.ogDescription || ''} onChange={e => set('ogDescription', e.target.value)} placeholder="e.g. Expert pain management care in Puerto Rico." />
        </Field>

        <Field label="Social Share Image URL" hint="Image shown when your site is shared on social media. Recommended size: 1200 × 630px.">
          <input style={s.input} value={form.ogImageUrl || ''} onChange={e => set('ogImageUrl', e.target.value)} placeholder="https://..." />
        </Field>
      </div>

      {/* ── SAVE ALL ──────────────────────────────────────────────── */}
      <div style={s.saveBar}>
        <button
          style={{ ...s.saveBtn, opacity: saveState === 'saving' ? 0.7 : 1 }}
          onClick={handleSaveAll}
          disabled={saveState === 'saving'}
        >
          {saveState === 'saving' ? 'Saving…' : 'Save All Changes'}
        </button>
        {saveState === 'saved' && <span style={s.savedMsg}>✓ All changes saved</span>}
        {saveState === 'error'  && <span style={s.errorMsg}>Something went wrong. Please try again.</span>}
      </div>

    </div>
  )
}

// ─── Helper component ─────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: '#374151' }}>{label}</label>
      {hint && <span style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.4rem' }}>{hint}</span>}
      {children}
    </div>
  )
}

// ─── Server-side data fetch ───────────────────────────────────────────────────
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session || !['client', 'admin'].includes(session.user.role)) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  await dbConnect()

  // Find the tenant for this session user
  const tenant = await Tenant.findById(session.user.tenantId).lean()
  if (!tenant) {
    // Admin without a tenantId — redirect to admin panel
    if (session.user.role === 'admin') {
      return { redirect: { destination: '/admin', permanent: false } }
    }
    return { redirect: { destination: '/login', permanent: false } }
  }

  // Fetch existing saved content for this tenant
  const existing = await SiteContent.findOne({ tenantId: tenant._id }).lean()

  // Serialize — convert ObjectIds and Dates to strings for Next.js props
  const initialContent = {
    businessName:    existing?.businessName    || '',
    heroHeadline:    existing?.heroHeadline    || '',
    heroSubheadline: existing?.heroSubheadline || '',
    aboutText:       existing?.aboutText       || '',
    services:        existing?.services        || [],
    contactPhone:    existing?.contactPhone    || '',
    contactEmail:    existing?.contactEmail    || '',
    contactAddress:  existing?.contactAddress  || '',
    logoUrl:         existing?.logoUrl         || '',
    heroImageUrl:    existing?.heroImageUrl    || '',
    seoTitle:        existing?.seoTitle        || '',
    seoDescription:  existing?.seoDescription  || '',
    seoKeywords:     existing?.seoKeywords     || '',
    ogTitle:         existing?.ogTitle         || '',
    ogDescription:   existing?.ogDescription   || '',
    ogImageUrl:      existing?.ogImageUrl      || '',
  }

  return {
    props: {
      clientEmail:    session.user.email,
      clientName:     session.user.name || null,
      siteSlug:       tenant.slug,
      initialContent,
      viewerRole:     session.user.role,
    }
  }
}
