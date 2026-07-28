import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import { parse as parseCookies } from 'cookie'
import dbConnect from '../../lib/db'
import SiteContent from '../../lib/models/SiteContent'
import Tenant from '../../lib/models/Tenant'

const inp = {
  width: '100%', padding: '10px 12px', fontSize: '0.9rem',
  borderRadius: '8px', border: '1px solid #e5e7eb',
  boxSizing: 'border-box', background: '#fff', color: '#111827',
  outline: 'none',
}
const ta = { ...inp, resize: 'vertical' }

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

export default function ClientDashboard({ clientEmail, clientName, siteSlug, initialContent, viewerRole }) {
  const router = useRouter()
  const [form, setForm] = useState(initialContent)
  const [saveState, setSaveState] = useState('idle')

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
  const removeService = i => {
    const updated = [...(form.services || [])]
    updated.splice(i, 1)
    setForm(f => ({ ...f, services: updated }))
  }

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
        setSaveState('error')
      }
    } catch (e) {
      setSaveState('error')
    }
  }

  const handleExitImpersonation = async () => {
    await fetch('/api/admin/impersonate-exit', { method: 'POST' })
    router.push('/admin')
  }

  const itemBox = { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem 1.1rem', marginBottom: '0.75rem' }
  const addBtn = { padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }
  const removeBtn = { padding: '5px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 }
  const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }

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
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <a
            href={`/site/${siteSlug}`}
            style={{ padding: '6px 14px', border: '1px solid #20b2aa', color: '#20b2aa', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}
          >
            ← Back to Site
          </a>
          {viewerRole !== 'admin' && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{ background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 14px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
            >
              Log Out
            </button>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 2rem 6rem' }}>

        {/* Admin impersonation banner */}
        {viewerRole === 'admin' && (
          <div style={{
            background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '10px',
            padding: '0.75rem 1.1rem', marginBottom: '1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
          }}>
            <span style={{ color: '#1d4ed8', fontSize: '0.875rem', fontWeight: 500 }}>
              👁 Viewing as admin — changes here <em>are</em> saved to this client&apos;s account.
            </span>
            <button
              onClick={handleExitImpersonation}
              style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              ← Back to Admin
            </button>
          </div>
        )}

        {/* Page Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>Welcome, {clientName || clientEmail}</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#6b7280' }}>Edit your site content below. Changes go live as soon as you save.</p>
        </div>

        {/* CONTENT */}
        <SectionCard title="Content" subtitle="Core text that appears throughout your public website.">
          <Field label="Business Name" hint="Your official business name — appears in the nav, footer, and page title.">
            <input style={inp} value={form.businessName || ''} onChange={e => set('businessName', e.target.value)} placeholder="e.g. Apex Pain Clinic" />
          </Field>
          <Field label="Hero Headline" hint="The large heading visitors see first. Keep it short and clear.">
            <input style={inp} value={form.heroHeadline || ''} onChange={e => set('heroHeadline', e.target.value)} placeholder="e.g. Expert Pain Management Care" />
          </Field>
          <Field label="Hero Subheadline" hint="One sentence below the headline. Optional but recommended.">
            <input style={inp} value={form.heroSubheadline || ''} onChange={e => set('heroSubheadline', e.target.value)} placeholder="e.g. Serving Puerto Rico since 2010" />
          </Field>
          <div style={twoCol}>
            <Field label="Hero Button Text" hint="Text on the call-to-action button.">
              <input style={inp} value={form.heroCtaText || ''} onChange={e => set('heroCtaText', e.target.value)} placeholder="e.g. Book an Appointment" />
            </Field>
            <Field label="Hero Button Link" hint="URL the button points to.">
              <input style={inp} value={form.heroCtaUrl || ''} onChange={e => set('heroCtaUrl', e.target.value)} placeholder="e.g. /contact or https://..." />
            </Field>
          </div>
          <Field label="About Text" hint="A short paragraph describing your practice, business, or background.">
            <textarea style={ta} rows={4} value={form.aboutText || ''} onChange={e => set('aboutText', e.target.value)} placeholder="e.g. We are a team of specialists dedicated to..." />
          </Field>

          {/* Services */}
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: '0.2rem' }}>Services <span style={{ fontWeight: 400, color: '#9ca3af' }}>(up to 6)</span></label>
            <span style={{ display: 'block', fontSize: '0.76rem', color: '#9ca3af', marginBottom: '0.75rem' }}>List the main services you offer. Each one gets a title and a short description.</span>
            {(form.services || []).map((svc, i) => (
              <div key={i} style={itemBox}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <input style={{ ...inp, flex: 1 }} value={svc.title || ''} onChange={e => setService(i, 'title', e.target.value)} placeholder={`Service ${i + 1} title`} />
                  <button style={removeBtn} onClick={() => removeService(i)}>✕ Remove</button>
                </div>
                <textarea style={ta} rows={2} value={svc.description || ''} onChange={e => setService(i, 'description', e.target.value)} placeholder="Short description of this service..." />
              </div>
            ))}
            {(form.services || []).length < 6 && (
              <button style={addBtn} onClick={addService}>+ Add Service</button>
            )}
          </div>
        </SectionCard>

        {/* TEAM */}
        <SectionCard title="Team Members" subtitle="Up to 6 team members displayed on your site.">
          {(form.teamMembers || []).map((member, i) => (
            <div key={i} style={itemBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '0.85rem', color: '#374151' }}>Member {i + 1}</strong>
                <button style={removeBtn} onClick={() => removeTeamMember(i)}>✕ Remove</button>
              </div>
              <div style={twoCol}>
                <Field label="Name" hint="">
                  <input style={inp} value={member.name || ''} onChange={e => setTeamMember(i, 'name', e.target.value)} placeholder="e.g. Dr. Maria Torres" />
                </Field>
                <Field label="Title / Role" hint="">
                  <input style={inp} value={member.title || ''} onChange={e => setTeamMember(i, 'title', e.target.value)} placeholder="e.g. Pain Medicine Specialist" />
                </Field>
              </div>
              <Field label="Bio" hint="A short paragraph about this person.">
                <textarea style={ta} rows={3} value={member.bio || ''} onChange={e => setTeamMember(i, 'bio', e.target.value)} placeholder="Brief background, credentials, and specialty..." />
              </Field>
              <Field label="Photo URL" hint="Direct link to their profile photo.">
                <input style={inp} value={member.imageUrl || ''} onChange={e => setTeamMember(i, 'imageUrl', e.target.value)} placeholder="https://..." />
              </Field>
            </div>
          ))}
          {(form.teamMembers || []).length < 6 && (
            <button style={addBtn} onClick={addTeamMember}>+ Add Team Member</button>
          )}
        </SectionCard>

        {/* TESTIMONIALS */}
        <SectionCard title="Testimonials" subtitle="Up to 4 client or patient quotes.">
          {(form.testimonials || []).map((t, i) => (
            <div key={i} style={itemBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '0.85rem', color: '#374151' }}>Testimonial {i + 1}</strong>
                <button style={removeBtn} onClick={() => removeTestimonial(i)}>✕ Remove</button>
              </div>
              <Field label="Quote" hint="What the patient or client said.">
                <textarea style={ta} rows={3} value={t.quote || ''} onChange={e => setTestimonial(i, 'quote', e.target.value)} placeholder="e.g. The team at Apex changed my life..." />
              </Field>
              <div style={twoCol}>
                <Field label="Author" hint="">
                  <input style={inp} value={t.author || ''} onChange={e => setTestimonial(i, 'author', e.target.value)} placeholder="e.g. Carlos Rivera" />
                </Field>
                <Field label="Role / Context" hint="">
                  <input style={inp} value={t.role || ''} onChange={e => setTestimonial(i, 'role', e.target.value)} placeholder="e.g. Patient since 2021" />
                </Field>
              </div>
            </div>
          ))}
          {(form.testimonials || []).length < 4 && (
            <button style={addBtn} onClick={addTestimonial}>+ Add Testimonial</button>
          )}
        </SectionCard>

        {/* CONTACT */}
        <SectionCard title="Contact" subtitle="Your publicly displayed contact information.">
          <Field label="Phone" hint="">
            <input style={inp} value={form.contactPhone || ''} onChange={e => set('contactPhone', e.target.value)} placeholder="e.g. (787) 555-0100" />
          </Field>
          <Field label="Email" hint="">
            <input style={inp} value={form.contactEmail || ''} onChange={e => set('contactEmail', e.target.value)} placeholder="e.g. hello@apexpain.com" />
          </Field>
          <Field label="Address" hint="">
            <input style={inp} value={form.contactAddress || ''} onChange={e => set('contactAddress', e.target.value)} placeholder="e.g. 123 Main St, San Juan, PR 00901" />
          </Field>
        </SectionCard>

        {/* MEDIA */}
        <SectionCard title="Media" subtitle="Image URLs for your logo and hero background.">
          <Field label="Logo URL" hint="Paste the URL of your logo image. Leave blank to use the default.">
            <input style={inp} value={form.logoUrl || ''} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Hero Image URL" hint="Background or banner photo for the hero section.">
            <input style={inp} value={form.heroImageUrl || ''} onChange={e => set('heroImageUrl', e.target.value)} placeholder="https://..." />
          </Field>
        </SectionCard>

        {/* SEO */}
        <SectionCard title="SEO & Social" subtitle="Controls how your site appears in Google and social media previews.">
          <Field label="Page Title" hint="Shows in the browser tab and Google results. Ideal: 50–60 characters.">
            <input style={inp} value={form.seoTitle || ''} onChange={e => set('seoTitle', e.target.value)} placeholder="e.g. Apex Pain Clinic — Pain Management in Puerto Rico" />
          </Field>
          <Field label="Meta Description" hint="Shown under your link in Google. Ideal: 150–160 characters.">
            <textarea style={ta} rows={3} value={form.seoDescription || ''} onChange={e => set('seoDescription', e.target.value)} placeholder="e.g. Apex Pain Clinic offers expert, compassionate care in Puerto Rico." />
          </Field>
          <Field label="Keywords" hint="Comma-separated words related to your business.">
            <input style={inp} value={form.seoKeywords || ''} onChange={e => set('seoKeywords', e.target.value)} placeholder="e.g. pain clinic, Puerto Rico, pain management" />
          </Field>
          <Field label="Social Share Title" hint="Shown when your site is shared on Facebook, WhatsApp, etc.">
            <input style={inp} value={form.ogTitle || ''} onChange={e => set('ogTitle', e.target.value)} placeholder="e.g. Apex Pain Clinic" />
          </Field>
          <Field label="Social Share Description" hint="Description in social share previews.">
            <textarea style={ta} rows={2} value={form.ogDescription || ''} onChange={e => set('ogDescription', e.target.value)} placeholder="e.g. Expert pain management care in Puerto Rico." />
          </Field>
          <Field label="Social Share Image URL" hint="Recommended size: 1200 × 630px.">
            <input style={inp} value={form.ogImageUrl || ''} onChange={e => set('ogImageUrl', e.target.value)} placeholder="https://..." />
          </Field>
        </SectionCard>

      </main>

      {/* Sticky Save Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem',
        zIndex: 50,
      }}>
        {saveState === 'saved' && <span style={{ fontSize: '0.875rem', color: '#16a34a', fontWeight: 500 }}>✓ All changes saved</span>}
        {saveState === 'error'  && <span style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: 500 }}>Something went wrong. Try again.</span>}
        <button
          onClick={handleSaveAll}
          disabled={saveState === 'saving'}
          style={{
            padding: '10px 28px',
            background: saveState === 'saving' ? '#a5b4fc' : '#4f46e5',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '0.95rem', fontWeight: 600,
            cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
          }}
        >
          {saveState === 'saving' ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>

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
    props: { clientEmail, clientName, siteSlug: tenant.slug, initialContent, viewerRole: session.user.role }
  }
}
