import { useState } from 'react'
import Head from 'next/head'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import { parse as parseCookies } from 'cookie'
import dbConnect from '../../lib/db'
import SiteContent from '../../lib/models/SiteContent'
import Tenant from '../../lib/models/Tenant'
import ImageUploadButton from '../../components/ImageUploadButton'
import Icon from '../../components/Icon'
import { theme } from '../../lib/theme'

const inp = {
  width: '100%', padding: '10px 12px', fontSize: '0.9rem',
  borderRadius: theme.radius.sm, border: `1px solid ${theme.color.border}`,
  boxSizing: 'border-box', background: theme.color.surface, color: theme.color.ink,
}
const ta = { ...inp, resize: 'vertical' }
const uploadBtn = {
  padding: '10px 16px', background: theme.color.accentSoft, border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.sm, fontSize: '0.85rem', fontWeight: 600, color: theme.color.accent, whiteSpace: 'nowrap',
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem', color: theme.color.inkSoft }}>{label}</label>
      {hint && <span style={{ display: 'block', fontSize: '0.76rem', color: theme.color.inkFaint, marginBottom: '0.4rem' }}>{hint}</span>}
      {children}
    </div>
  )
}

// Registry driving both the quick-nav rail and each SectionCard's identity —
// one source of truth so the two stay in sync. Tone alternates indigo/teal
// per section so cards are tellable apart by color, not just icon shape.
const SECTIONS = [
  { id: 'content',      icon: 'document', label: 'Content',     tone: 'accent' },
  { id: 'trust-bar',    icon: 'shield',   label: 'Trust Bar',    tone: 'live' },
  { id: 'team',         icon: 'users',    label: 'Team',         tone: 'accent' },
  { id: 'testimonials', icon: 'message',  label: 'Testimonials', tone: 'live' },
  { id: 'contact',      icon: 'mail',     label: 'Contact',      tone: 'accent' },
  { id: 'media',        icon: 'image',    label: 'Media',        tone: 'live' },
  { id: 'seo',          icon: 'search',   label: 'SEO',          tone: 'accent' },
]

function SectionCard({ id, icon, tone = 'accent', title, subtitle, children }) {
  const tileBg = tone === 'live' ? theme.color.liveSoft : theme.color.accentSoft
  const tileFg = tone === 'live' ? theme.color.live : theme.color.accent
  return (
    <div id={id} style={{
      background: theme.color.surface, borderRadius: theme.radius.lg,
      boxShadow: theme.shadow.card, padding: '1.75rem', marginBottom: '1.25rem',
      scrollMarginTop: '132px', // keeps the jumped-to card clear of the sticky nav + quick-nav rail
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
        marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: `1px solid ${theme.color.divider}`,
      }}>
        {icon && (
          <div style={{
            width: '36px', height: '36px', borderRadius: theme.radius.sm, flexShrink: 0,
            background: tileBg, color: tileFg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={icon} size={17} />
          </div>
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: theme.color.ink, letterSpacing: '-0.01em' }}>{title}</h2>
          {subtitle && <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: theme.color.inkFaint }}>{subtitle}</p>}
        </div>
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

  const setTrustBarItem = (i, val) => {
    const updated = [...(form.trustBarItems || [])]
    updated[i] = val
    setForm(f => ({ ...f, trustBarItems: updated }))
  }
  const addTrustBarItem = () => {
    if ((form.trustBarItems || []).length >= 6) return
    setForm(f => ({ ...f, trustBarItems: [...(f.trustBarItems || []), ''] }))
  }
  const removeTrustBarItem = i => {
    const updated = [...(form.trustBarItems || [])]
    updated.splice(i, 1)
    setForm(f => ({ ...f, trustBarItems: updated }))
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

  const itemBox = { background: theme.color.surfaceMuted, border: `1px solid ${theme.color.divider}`, borderRadius: theme.radius.md, padding: '1rem 1.1rem', marginBottom: '0.75rem' }
  const addBtn = {
    padding: '9px 16px', background: 'transparent', border: `1.5px dashed ${theme.color.borderStrong}`,
    borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: theme.color.accent,
  }
  const removeBtn = { padding: '5px 10px', background: theme.color.dangerSoft, border: `1px solid ${theme.color.dangerBorder}`, borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: theme.color.danger, fontWeight: 600 }
  const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }

  return (
    <>
      <Head>
        <style>{`
          @keyframes dashSavePop {
            0%   { opacity: 0; transform: scale(0.85); }
            60%  { opacity: 1; transform: scale(1.04); }
            100% { opacity: 1; transform: scale(1); }
          }
          .dash-save-msg { animation: dashSavePop 0.28s ease-out; }
        `}</style>
      </Head>

      {/* Ambient page wash — static, no motion. A work surface gets a quiet
          version of the "living" identity, not the login page's full effect. */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: theme.color.bg,
        backgroundImage: `radial-gradient(1100px 560px at 88% -8%, rgba(79,70,229,0.07), transparent 60%), radial-gradient(900px 480px at -8% 105%, rgba(32,178,170,0.06), transparent 55%)`,
      }} />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', fontFamily: theme.font }}>

        {/* Top Nav */}
        <nav style={{
          background: theme.color.surface, position: 'sticky', top: 0, zIndex: 50,
          padding: '0 2rem', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: theme.color.accent, letterSpacing: '-0.02em' }}>Canvō</span>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <a
              href={`/site/${siteSlug}`}
              style={{ padding: '7px 14px', border: `1.5px solid ${theme.color.live}`, color: theme.color.live, borderRadius: theme.radius.sm, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
            >
              ← Back to Site
            </a>
            {viewerRole !== 'admin' && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ background: 'transparent', color: theme.color.inkSoft, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, padding: '7px 14px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
              >
                Log Out
              </button>
            )}
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '2px', background: `linear-gradient(90deg, ${theme.color.accent}, ${theme.color.live})` }} />
        </nav>

        {/* Section quick-nav — jump straight to a section instead of scrolling past everything */}
        <div style={{
          position: 'sticky', top: '60px', zIndex: 40,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)',
          borderBottom: `1px solid ${theme.color.divider}`,
        }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0.6rem 2rem', display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0,
                  padding: '5px 11px', borderRadius: theme.radius.pill,
                  fontSize: '0.78rem', fontWeight: 600, color: theme.color.inkSoft,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                <Icon name={s.icon} size={13} color={s.tone === 'live' ? theme.color.live : theme.color.accent} />
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <main style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 2rem 6rem' }}>

          {/* Admin impersonation banner */}
          {viewerRole === 'admin' && (
            <div style={{
              background: theme.color.warnSoft, border: `1px solid ${theme.color.warnBorder}`, borderRadius: theme.radius.md,
              padding: '0.8rem 1.1rem', marginBottom: '1.5rem',
              boxShadow: '0 1px 2px rgba(180,83,9,0.05), 0 8px 20px -10px rgba(180,83,9,0.2)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
            }}>
              <span style={{ color: theme.color.warn, fontSize: '0.875rem', fontWeight: 500 }}>
                👁 Viewing as admin — changes here <em>are</em> saved to this client&apos;s account.
              </span>
              <button
                onClick={handleExitImpersonation}
                style={{ background: theme.color.warn, color: '#fff', border: 'none', borderRadius: theme.radius.sm, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                ← Back to Admin
              </button>
            </div>
          )}

          {/* Page Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 800, color: theme.color.ink, letterSpacing: '-0.02em' }}>Welcome, {clientName || clientEmail}</h1>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: theme.color.inkFaint }}>Edit your site content below. Changes go live as soon as you save.</p>
          </div>

          {/* CONTENT */}
          <SectionCard id="content" icon="document" tone="accent" title="Content" subtitle="Core text that appears throughout your public website.">
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
            <div style={twoCol}>
              <Field label="Nav Button Text" hint="Top-right button in the site navigation.">
                <input style={inp} value={form.navCtaText || ''} onChange={e => set('navCtaText', e.target.value)} placeholder="e.g. Book Appointment or Get Started" />
              </Field>
              <Field label="Contact Section Heading" hint="Heading above your contact form.">
                <input style={inp} value={form.contactHeading || ''} onChange={e => set('contactHeading', e.target.value)} placeholder="e.g. Book Your Appointment or Contact Us" />
              </Field>
            </div>

            {/* Services */}
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: theme.color.inkSoft, marginBottom: '0.2rem' }}>Services <span style={{ fontWeight: 400, color: theme.color.inkFaint }}>(up to 6)</span></label>
              <span style={{ display: 'block', fontSize: '0.76rem', color: theme.color.inkFaint, marginBottom: '0.75rem' }}>List the main services you offer. Each one gets a title and a short description.</span>
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

          {/* TRUST BAR */}
          <SectionCard id="trust-bar" icon="shield" tone="live" title="Trust Bar" subtitle="Short scrolling taglines shown right under your hero banner (up to 6). Leave empty to hide this bar.">
            {(form.trustBarItems || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.6rem', alignItems: 'center' }}>
                <input style={{ ...inp, flex: 1 }} value={item || ''} onChange={e => setTrustBarItem(i, e.target.value)} placeholder="e.g. Trusted by 500+ Clients" />
                <button style={removeBtn} onClick={() => removeTrustBarItem(i)}>✕ Remove</button>
              </div>
            ))}
            {(form.trustBarItems || []).length < 6 && (
              <button style={addBtn} onClick={addTrustBarItem}>+ Add Trust Bar Item</button>
            )}
          </SectionCard>

          {/* TEAM */}
          <SectionCard id="team" icon="users" tone="accent" title="Team Members" subtitle="Up to 6 team members displayed on your site.">
            {(form.teamMembers || []).map((member, i) => (
              <div key={i} style={itemBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: theme.color.inkSoft }}>Member {i + 1}</strong>
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
                <Field label="Photo" hint="Upload a headshot, or paste a URL if it's already hosted somewhere.">
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <input style={{ ...inp, flex: 1 }} value={member.imageUrl || ''} onChange={e => setTeamMember(i, 'imageUrl', e.target.value)} placeholder="https://..." />
                    <ImageUploadButton label="Upload" onUploaded={url => setTeamMember(i, 'imageUrl', url)} style={uploadBtn} />
                  </div>
                </Field>
              </div>
            ))}
            {(form.teamMembers || []).length < 6 && (
              <button style={addBtn} onClick={addTeamMember}>+ Add Team Member</button>
            )}
          </SectionCard>

          {/* TESTIMONIALS */}
          <SectionCard id="testimonials" icon="message" tone="live" title="Testimonials" subtitle="Up to 4 client or patient quotes.">
            {(form.testimonials || []).map((t, i) => (
              <div key={i} style={itemBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: theme.color.inkSoft }}>Testimonial {i + 1}</strong>
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
          <SectionCard id="contact" icon="mail" tone="accent" title="Contact" subtitle="Your publicly displayed contact information.">
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
          <SectionCard id="media" icon="image" tone="live" title="Media" subtitle="Image URLs for your logo and hero background.">
            <Field label="Logo" hint="Upload an image, or paste a URL if it's already hosted somewhere.">
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input style={{ ...inp, flex: 1 }} value={form.logoUrl || ''} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." />
                <ImageUploadButton label="Upload" onUploaded={url => set('logoUrl', url)} style={uploadBtn} />
              </div>
            </Field>
            <Field label="Hero Image" hint="Background or banner photo for the hero section.">
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input style={{ ...inp, flex: 1 }} value={form.heroImageUrl || ''} onChange={e => set('heroImageUrl', e.target.value)} placeholder="https://..." />
                <ImageUploadButton label="Upload" onUploaded={url => set('heroImageUrl', url)} style={uploadBtn} />
              </div>
            </Field>
          </SectionCard>

          {/* SEO */}
          <SectionCard id="seo" icon="search" tone="accent" title="SEO & Social" subtitle="Controls how your site appears in Google and social media previews.">
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
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: theme.color.surface,
          boxShadow: '0 -4px 24px -10px rgba(79,70,229,0.22)',
          padding: '1rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem',
        }}>
          {saveState === 'saved' && <span className="dash-save-msg" style={{ fontSize: '0.875rem', color: theme.color.good, fontWeight: 600 }}>✓ All changes saved</span>}
          {saveState === 'error'  && <span style={{ fontSize: '0.875rem', color: theme.color.danger, fontWeight: 600 }}>Something went wrong. Try again.</span>}
          <button
            onClick={handleSaveAll}
            disabled={saveState === 'saving'}
            style={{
              padding: '11px 30px',
              background: saveState === 'saving' ? '#a5b4fc' : theme.color.accent,
              color: '#fff', border: 'none', borderRadius: theme.radius.sm,
              fontSize: '0.95rem', fontWeight: 700,
              cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
              boxShadow: saveState === 'saving' ? 'none' : theme.shadow.button,
            }}
          >
            {saveState === 'saving' ? 'Saving…' : 'Save All Changes'}
          </button>
        </div>

      </div>
    </>
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
    navCtaText:      existing?.navCtaText      || '',
    contactHeading:  existing?.contactHeading  || '',
    trustBarItems:   existing?.trustBarItems   || [],
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
