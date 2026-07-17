import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import { parse as parseCookies } from 'cookie'
import dbConnect from '../../lib/db'
import SiteContent from '../../lib/models/SiteContent'
import Tenant from '../../lib/models/Tenant'

// ─── Styles ──────────────────────────────────────────────────────────────────────────────────
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
  itemBox:     { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' },
  itemRow:     { display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' },
  addBtn:      { padding: '0.4rem 1rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 },
  removeBtn:   { padding: '0.3rem 0.6rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 },
  twoCol:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
}

export default function ClientDashboard({ clientEmail, clientName, siteSlug, initialContent, viewerRole }) {
  const router = useRouter()
  const [form, setForm] = useState(initialContent)
  const [saveState, setSaveState] = useState('idle')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // ── Services helpers
  const setService = (i, key, val) => {
    const updated = [...(form.services || [])]
    updated[i] = { ...updated[i], [key]: val }
    setForm(f => ({ ...f, services: updated }))
  }
  const addService = () => {
    if ((form.services || []).length >= 6) return
    setForm(f => ({ ...f, services: [...(f.services || []), { title: '', description: '' }] }))
  }
  const removeService = i => {
    const updated = [...(form.services || [])]
    updated.splice(i, 1)
    setForm(f => ({ ...f, services: updated }))
  }

  // ── Team Members helpers
  const setTeamMember = (i, key, val) => {
    const updated = [...(form.teamMembers || [])]
    updated[i] = { ...updated[i], [key]: val }
    setForm(f => ({ ...f, teamMembers: updated }))
  }
  const addTeamMember = () => {
    if ((form.teamMembers || []).length >= 6) return
    setForm(f => ({ ...f, teamMembers: [...(f.teamMembers || []), { name: '', title: '', bio: '', imageUrl: '' }] }))
  }
  const removeTeamMember = i => {
    const updated = [...(form.teamMembers || [])]
    updated.splice(i, 1)
    setForm(f => ({ ...f, teamMembers: updated }))
  }

  // ── Testimonials helpers
  const setTestimonial = (i, key, val) => {
    const updated = [...(form.testimonials || [])]
    updated[i] = { ...updated[i], [key]: val }
    setForm(f => ({ ...f, testimonials: updated }))
  }
  const addTestimonial = () => {
    if ((form.testimonials || []).length >= 4) return
    setForm(f => ({ ...f, testimonials: [...(f.testimonials || []), { quote: '', author: '', role: '' }] }))
  }
  const removeTestimonial = i => {
    const updated = [...(form.testimonials || [])]
    updated.splice(i, 1)
    setForm(f => ({ ...f, testimonials: updated }))
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

  const handleExitImpersonation = async () => {
    await fetch('/api/admin/impersonate-exit', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <div style={s.page}>

      {viewerRole === 'admin' && (
        <div style={s.adminBanner}>
          <span style={s.adminText}>👁 Viewing as admin — changes here <em>are</em> saved to this client&apos;s account.</span>
          <button style={s.backBtn} onClick={handleExitImpersonation}>← Back to Admin</button>
        </div>
      )}

      <div style={s.header}>
        <div>
          <h1 style={s.name}>Welcome, {clientName || clientEmail}</h1>
          <p style={s.email}>{clientEmail}</p>
        </div>
        {viewerRole !== 'admin' && (
          <button style={s.logoutBtn} onClick={() => signOut({ callbackUrl: '/login' })}>Log Out</button>
        )}
      </div>

      {/* ─────────────────── CONTENT ──────────────────── */}
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

        <div style={s.twoCol}>
          <Field label="Hero Button Text" hint="Text on the call-to-action button.">
            <input style={s.input} value={form.heroCtaText || ''} onChange={e => set('heroCtaText', e.target.value)} placeholder="e.g. Book an Appointment" />
          </Field>
          <Field label="Hero Button Link" hint="URL the button points to.">
            <input style={s.input} value={form.heroCtaUrl || ''} onChange={e => set('heroCtaUrl', e.target.value)} placeholder="e.g. /contact or https://..." />
          </Field>
        </div>

        <Field label="About Text" hint="A short paragraph describing your practice, business, or background.">
          <textarea style={s.textarea} rows={4} value={form.aboutText || ''} onChange={e => set('aboutText', e.target.value)} placeholder="e.g. We are a team of specialists dedicated to..." />
        </Field>

        {/* Services */}
        <div style={s.field}>
          <label style={s.label}>Services <span style={{ fontWeight: 400, color: '#9ca3af' }}>(up to 6)</span></label>
          <span style={s.hint}>List the main services you offer. Each one gets a title and a short description.</span>
          {(form.services || []).map((svc, i) => (
            <div key={i} style={s.itemBox}>
              <div style={s.itemRow}>
                <input style={{ ...s.input, flex: 1 }} value={svc.title || ''} onChange={e => setService(i, 'title', e.target.value)} placeholder={`Service ${i + 1} title`} />
                <button style={s.removeBtn} onClick={() => removeService(i)}>✕ Remove</button>
              </div>
              <textarea style={{ ...s.textarea, marginTop: 0 }} rows={2} value={svc.description || ''} onChange={e => setService(i, 'description', e.target.value)} placeholder="Short description of this service..." />
            </div>
          ))}
          {(form.services || []).length < 6 && (
            <button style={s.addBtn} onClick={addService}>+ Add Service</button>
          )}
        </div>
      </div>

      {/* ─────────────────── TEAM ────────────────────── */}
      <div style={s.section}>
        <h2 style={s.sectionHead}>Team Members <span style={{ fontSize: '0.8rem', fontWeight: 400, textTransform: 'none', color: '#9ca3af' }}>(up to 6)</span></h2>
        {(form.teamMembers || []).map((member, i) => (
          <div key={i} style={s.itemBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#374151' }}>Member {i + 1}</strong>
              <button style={s.removeBtn} onClick={() => removeTeamMember(i)}>✕ Remove</button>
            </div>
            <div style={s.twoCol}>
              <Field label="Name" hint="">
                <input style={s.input} value={member.name || ''} onChange={e => setTeamMember(i, 'name', e.target.value)} placeholder="e.g. Dr. Maria Torres" />
              </Field>
              <Field label="Title / Role" hint="">
                <input style={s.input} value={member.title || ''} onChange={e => setTeamMember(i, 'title', e.target.value)} placeholder="e.g. Pain Medicine Specialist" />
              </Field>
            </div>
            <Field label="Bio" hint="A short paragraph about this person.">
              <textarea style={s.textarea} rows={3} value={member.bio || ''} onChange={e => setTeamMember(i, 'bio', e.target.value)} placeholder="Brief background, credentials, and specialty..." />
            </Field>
            <Field label="Photo URL" hint="Direct link to their profile photo.">
              <input style={s.input} value={member.imageUrl || ''} onChange={e => setTeamMember(i, 'imageUrl', e.target.value)} placeholder="https://..." />
            </Field>
          </div>
        ))}
        {(form.teamMembers || []).length < 6 && (
          <button style={s.addBtn} onClick={addTeamMember}>+ Add Team Member</button>
        )}
      </div>

      {/* ─────────────────── TESTIMONIALS ─────────────── */}
      <div style={s.section}>
        <h2 style={s.sectionHead}>Testimonials <span style={{ fontSize: '0.8rem', fontWeight: 400, textTransform: 'none', color: '#9ca3af' }}>(up to 4)</span></h2>
        {(form.testimonials || []).map((t, i) => (
          <div key={i} style={s.itemBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#374151' }}>Testimonial {i + 1}</strong>
              <button style={s.removeBtn} onClick={() => removeTestimonial(i)}>✕ Remove</button>
            </div>
            <Field label="Quote" hint="What the patient or client said.">
              <textarea style={s.textarea} rows={3} value={t.quote || ''} onChange={e => setTestimonial(i, 'quote', e.target.value)} placeholder="e.g. The team at Apex changed my life. I can finally move without pain." />
            </Field>
            <div style={s.twoCol}>
              <Field label="Author" hint="">
                <input style={s.input} value={t.author || ''} onChange={e => setTestimonial(i, 'author', e.target.value)} placeholder="e.g. Carlos Rivera" />
              </Field>
              <Field label="Role / Context" hint="">
                <input style={s.input} value={t.role || ''} onChange={e => setTestimonial(i, 'role', e.target.value)} placeholder="e.g. Patient since 2021" />
              </Field>
            </div>
          </div>
        ))}
        {(form.testimonials || []).length < 4 && (
          <button style={s.addBtn} onClick={addTestimonial}>+ Add Testimonial</button>
        )}
      </div>

      {/* ─────────────────── CONTACT ─────────────────── */}
      <div style={s.section}>
        <h2 style={s.sectionHead}>Contact</h2>
        <Field label="Phone" hint="">
          <input style={s.input} value={form.contactPhone || ''} onChange={e => set('contactPhone', e.target.value)} placeholder="e.g. (787) 555-0100" />
        </Field>
        <Field label="Email" hint="">
          <input style={s.input} value={form.contactEmail || ''} onChange={e => set('contactEmail', e.target.value)} placeholder="e.g. hello@apexpain.com" />
        </Field>
        <Field label="Address" hint="">
          <input style={s.input} value={form.contactAddress || ''} onChange={e => set('contactAddress', e.target.value)} placeholder="e.g. 123 Main St, San Juan, PR 00901" />
        </Field>
      </div>

      {/* ─────────────────── MEDIA ──────────────────── */}
      <div style={s.section}>
        <h2 style={s.sectionHead}>Media</h2>
        <Field label="Logo URL" hint="Paste the URL of your logo image. Leave blank to use the default.">
          <input style={s.input} value={form.logoUrl || ''} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="Hero Image URL" hint="Background or banner photo for the hero section. Leave blank to use the default.">
          <input style={s.input} value={form.heroImageUrl || ''} onChange={e => set('heroImageUrl', e.target.value)} placeholder="https://..." />
        </Field>
      </div>

      {/* ─────────────────── SEO ───────────────────── */}
      <div style={s.section}>
        <h2 style={s.sectionHead}>SEO &amp; Social</h2>
        <Field label="Page Title" hint="Shows in the browser tab and Google search results. Ideal: 50–60 characters.">
          <input style={s.input} value={form.seoTitle || ''} onChange={e => set('seoTitle', e.target.value)} placeholder="e.g. Apex Pain Clinic — Pain Management in Puerto Rico" />
        </Field>
        <Field label="Meta Description" hint="Shown under your link in Google. Ideal: 150–160 characters.">
          <textarea style={s.textarea} rows={3} value={form.seoDescription || ''} onChange={e => set('seoDescription', e.target.value)} placeholder="e.g. Apex Pain Clinic offers expert, compassionate pain management care in Puerto Rico." />
        </Field>
        <Field label="Keywords" hint="Comma-separated words related to your business.">
          <input style={s.input} value={form.seoKeywords || ''} onChange={e => set('seoKeywords', e.target.value)} placeholder="e.g. pain clinic, Puerto Rico, pain management" />
        </Field>
        <Field label="Social Share Title" hint="Shown when your site is shared on Facebook, WhatsApp, etc.">
          <input style={s.input} value={form.ogTitle || ''} onChange={e => set('ogTitle', e.target.value)} placeholder="e.g. Apex Pain Clinic" />
        </Field>
        <Field label="Social Share Description" hint="Description in social share previews.">
          <textarea style={s.textarea} rows={2} value={form.ogDescription || ''} onChange={e => set('ogDescription', e.target.value)} placeholder="e.g. Expert pain management care in Puerto Rico." />
        </Field>
        <Field label="Social Share Image URL" hint="Recommended size: 1200 × 630px.">
          <input style={s.input} value={form.ogImageUrl || ''} onChange={e => set('ogImageUrl', e.target.value)} placeholder="https://..." />
        </Field>
      </div>

      {/* ─────────────────── SAVE ───────────────────── */}
      <div style={s.saveBar}>
        <button style={{ ...s.saveBtn, opacity: saveState === 'saving' ? 0.7 : 1 }} onClick={handleSaveAll} disabled={saveState === 'saving'}>
          {saveState === 'saving' ? 'Saving…' : 'Save All Changes'}
        </button>
        {saveState === 'saved' && <span style={s.savedMsg}>✓ All changes saved</span>}
        {saveState === 'error'  && <span style={s.errorMsg}>Something went wrong. Please try again.</span>}
      </div>

    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: '#374151' }}>{label}</label>
      {hint && <span style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.4rem' }}>{hint}</span>}
      {children}
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session || !['client', 'admin'].includes(session.user.role)) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  await dbConnect()

  let tenantId = session.user.tenantId

  if (session.user.role === 'admin') {
    const cookies = parseCookies(context.req.headers.cookie || '')
    if (cookies.adminViewingTenantId) {
      tenantId = cookies.adminViewingTenantId
    } else {
      return { redirect: { destination: '/admin', permanent: false } }
    }
  }

  const tenant = await Tenant.findById(tenantId).lean()
  if (!tenant) {
    return { redirect: { destination: session.user.role === 'admin' ? '/admin' : '/login', permanent: false } }
  }

  const existing = await SiteContent.findOne({ tenantId: tenant._id }).lean()

  const initialContent = {
    businessName:    existing?.businessName    || '',
    heroHeadline:    existing?.heroHeadline    || '',
    heroSubheadline: existing?.heroSubheadline || '',
    heroCtaText:     existing?.heroCtaText     || '',
    heroCtaUrl:      existing?.heroCtaUrl      || '',
    aboutText:       existing?.aboutText       || '',
    services:        existing?.services        || [],
    teamMembers:     existing?.teamMembers     || [],
    testimonials:    existing?.testimonials    || [],
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

  let clientEmail = session.user.email
  let clientName  = session.user.name || null

  if (session.user.role === 'admin') {
    const User = (await import('../../lib/models/User')).default
    const clientUser = await User.findOne({ tenantId: tenant._id, role: 'client' }).select('name email').lean()
    if (clientUser) {
      clientEmail = clientUser.email
      clientName  = clientUser.name || null
    }
  }

  return {
    props: {
      clientEmail,
      clientName,
      siteSlug:       tenant.slug,
      initialContent,
      viewerRole:     session.user.role,
    }
  }
}
