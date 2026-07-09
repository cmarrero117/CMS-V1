import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { getSession } from 'next-auth/react'
import dbConnect from '../../lib/db'
import SiteContent from '../../lib/models/SiteContent'
import Tenant from '../../lib/models/Tenant'

// ─── Allowed fonts ────────────────────────────────────────────────────────────
const FONTS = [
  { label: 'Georgia (Default)', value: "'Georgia', serif" },
  { label: 'Inter',             value: 'Inter, sans-serif' },
  { label: 'Merriweather',      value: 'Merriweather, serif' },
  { label: 'Playfair Display',  value: "'Playfair Display', serif" },
  { label: 'Roboto',            value: 'Roboto, sans-serif' },
  { label: 'Oswald',            value: 'Oswald, sans-serif' },
]

// ─── Shared micro-styles ──────────────────────────────────────────────────────
const btn = {
  base: {
    border: '1px solid #3f3f5a', borderRadius: '6px', padding: '5px 14px',
    cursor: 'pointer', fontSize: '12px', fontFamily: 'sans-serif',
    display: 'inline-flex', alignItems: 'center', gap: '4px',
  },
  dark:  { background: '#2a2a3e', color: '#fff' },
  indigo:{ background: '#4f46e5', color: '#fff', border: 'none' },
  green: { background: '#10b981', color: '#fff', border: 'none' },
  red:   { background: '#ef4444', color: '#fff', border: 'none' },
  white: { background: '#fff',    color: '#4f46e5', border: 'none' },
  gray:  { background: '#6b7280', color: '#fff', border: 'none' },
}
const mkBtn = (...variants) => Object.assign({}, btn.base, ...variants.map(v => btn[v]))

// ─── EditableText ─────────────────────────────────────────────────────────────
function EditableText({ value, onChange, tag: Tag = 'span', style, editMode, placeholder }) {
  const [editing, setEditing]     = useState(false)
  const [local, setLocal]         = useState(value || '')
  const [showFonts, setShowFonts] = useState(false)
  const [font, setFont]           = useState(FONTS[0].value)

  useEffect(() => { setLocal(value || '') }, [value])

  const mergedStyle = { ...style, fontFamily: font }

  if (!editMode) {
    return <Tag style={mergedStyle}>{value || ''}</Tag>
  }

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {editing && (
        <span style={{
          position: 'absolute', bottom: '100%', left: 0, zIndex: 9999,
          display: 'inline-flex', gap: '4px', background: '#1e1e2e',
          padding: '5px 8px', borderRadius: '8px', marginBottom: '4px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
        }}>
          <button onMouseDown={e => { e.preventDefault(); setShowFonts(f => !f) }}
            style={mkBtn('dark')}>Aa &#9662;</button>
          {showFonts && (
            <span style={{
              position: 'absolute', top: '100%', left: 0, background: '#2a2a3e',
              borderRadius: '8px', padding: '6px', zIndex: 10000, minWidth: '180px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)', marginTop: '4px',
            }}>
              {FONTS.map(f => (
                <span key={f.value} onMouseDown={e => { e.preventDefault(); setFont(f.value); setShowFonts(false) }}
                  style={{
                    display: 'block', padding: '6px 10px', cursor: 'pointer',
                    fontFamily: f.value, color: '#fff', borderRadius: '4px',
                    background: font === f.value ? '#4f46e5' : 'transparent',
                  }}>{f.label}</span>
              ))}
            </span>
          )}
          <button onMouseDown={e => { e.preventDefault(); onChange(local); setEditing(false) }}
            style={mkBtn('indigo')}>&#10003; Save</button>
          <button onMouseDown={e => { e.preventDefault(); setLocal(value || ''); setEditing(false) }}
            style={mkBtn('dark')}>&#10005;</button>
        </span>
      )}
      <Tag
        contentEditable={editing}
        suppressContentEditableWarning
        style={{
          ...mergedStyle,
          outline: editing ? '2px solid #4f46e5' : '1px dashed #c7d2fe',
          borderRadius: '3px', padding: editing ? '1px 4px' : '1px 4px',
          cursor: 'pointer', minWidth: '20px', display: 'inline-block',
        }}
        onClick={() => setEditing(true)}
        onInput={e => setLocal(e.currentTarget.textContent)}
        title="Click to edit"
      >{local || <span style={{ color: '#bbb', fontStyle: 'italic' }}>{placeholder}</span>}</Tag>
      {!editing && (
        <span style={{ fontSize: '9px', color: '#818cf8', marginLeft: '4px',
          fontFamily: 'sans-serif', fontWeight: 700, verticalAlign: 'super' }}>edit</span>
      )}
    </span>
  )
}

// ─── EditableImage ────────────────────────────────────────────────────────────
function EditableImage({ src, alt, onChange, editMode, imgStyle }) {
  const [hover, setHover]   = useState(false)
  const [modal, setModal]   = useState(false)
  const [urlVal, setUrlVal] = useState(src || '')
  const fileRef             = useRef(null)

  const imgEl = src
    ? <img src={src} alt={alt} style={imgStyle} loading="lazy" />
    : <div style={{ ...imgStyle, background: '#f3f4f6', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#9ca3af', fontSize: '14px', fontFamily: 'sans-serif' }}>No image</div>

  if (!editMode) return imgEl

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        onClick={() => setModal(true)}>
        {imgEl}
        {hover && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(79,70,229,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '13px', fontFamily: 'sans-serif',
            borderRadius: imgStyle.borderRadius || '0',
          }}>Change Image</div>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div style={{ background: '#1e1e2e', borderRadius: '12px', padding: '28px',
            width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', fontFamily: 'sans-serif' }}>
            <h3 style={{ color: '#fff', marginTop: 0 }}>Replace Image</h3>
            <p style={{ color: '#a1a1b5', fontSize: '13px' }}>Paste a URL or upload from your computer.</p>
            <input type="text" placeholder="https://example.com/photo.jpg" value={urlVal}
              onChange={e => setUrlVal(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #3f3f5a', background: '#2a2a3e', color: '#fff',
                fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box' }} />
            <p style={{ color: '#a1a1b5', fontSize: '12px', textAlign: 'center' }}>— or —</p>
            <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = ev => { onChange(ev.target.result); setModal(false) }
                reader.readAsDataURL(file)
              }} />
            <button onClick={() => fileRef.current.click()}
              style={{ ...mkBtn('dark'), width: '100%', justifyContent: 'center', marginBottom: '10px', padding: '9px' }}>
              Upload from computer
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { onChange(urlVal); setModal(false) }}
                style={{ ...mkBtn('indigo'), flex: 1, justifyContent: 'center', padding: '9px' }}>Use URL</button>
              <button onClick={() => setModal(false)}
                style={{ ...mkBtn('dark'), flex: 1, justifyContent: 'center', padding: '9px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Page styles ──────────────────────────────────────────────────────────────
const S = {
  page:      { fontFamily: "'Georgia', serif", color: '#1a1a1a', background: '#fff', minHeight: '100vh' },
  nav:       { borderBottom: '1px solid #e5e5e5', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', zIndex: 100 },
  navBrand:  { fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em', textDecoration: 'none', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.6rem' },
  navLinks:  { display: 'flex', gap: '1.5rem', fontSize: '0.9rem' },
  navLink:   { color: '#444', textDecoration: 'none' },
  hero:      { padding: 'clamp(4rem,10vw,8rem) clamp(1.5rem,6vw,5rem)', maxWidth: '860px', margin: '0 auto' },
  h1:        { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 700, lineHeight: 1.15, margin: 0, color: '#111' },
  sub:       { marginTop: '1rem', fontSize: 'clamp(1rem,2vw,1.2rem)', color: '#555', lineHeight: 1.5, maxWidth: '60ch' },
  heroImg:   { width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block', marginTop: '2rem', borderRadius: '8px' },
  hr:        { border: 'none', borderTop: '1px solid #eee', margin: '0 clamp(1.5rem,6vw,5rem)' },
  section:   { padding: 'clamp(3rem,8vw,6rem) clamp(1.5rem,6vw,5rem)', maxWidth: '860px', margin: '0 auto' },
  eyebrow:   { fontSize: '0.78rem', fontFamily: 'sans-serif', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginBottom: '1.25rem' },
  body:      { fontSize: 'clamp(1rem,2vw,1.15rem)', lineHeight: 1.75, maxWidth: '65ch', margin: 0, color: '#333' },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' },
  card:      { background: '#f9f9f9', borderRadius: '8px', padding: '1.25rem 1.5rem', border: '1px solid #eee' },
  cardTitle: { fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem', color: '#111' },
  cardDesc:  { fontSize: '0.9rem', color: '#555', lineHeight: 1.6, margin: 0 },
  contactRow:{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'sans-serif', fontSize: '0.95rem', color: '#333' },
  footer:    { borderTop: '1px solid #eee', padding: '1.5rem clamp(1.5rem,6vw,5rem)', fontSize: '0.8rem', color: '#aaa', fontFamily: 'sans-serif', marginTop: '2rem' },
  notFound:  { fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#444', background: '#f9f9f9' },
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PublicSite({ notFound, tenant, c: initialC, canEdit, slug }) {
  const [c, setC]               = useState(initialC || {})
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  function set(field, value) {
    setC(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/site-content/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
      else alert('Save failed — please try again.')
    } catch { alert('Network error — please try again.') }
    setSaving(false)
  }

  if (notFound || !tenant) {
    return (
      <div style={S.notFound}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404</h1>
        <p>This site does not exist yet.</p>
      </div>
    )
  }

  const siteName = c.businessName || tenant.name

  return (
    <>
      <Head>
        <title>{c.seoTitle || siteName}</title>
        {c.seoDescription && <meta name="description" content={c.seoDescription} />}
        {c.seoKeywords    && <meta name="keywords"    content={c.seoKeywords} />}
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content={c.ogTitle || siteName} />
        {c.ogDescription  && <meta property="og:description" content={c.ogDescription} />}
        {c.ogImageUrl     && <meta property="og:image"       content={c.ogImageUrl} />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {editMode && (
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;700&family=Oswald:wght@400;700&display=swap" rel="stylesheet" />
        )}
      </Head>

      {/* ── Edit bar (only for authorised users) ── */}
      {canEdit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99998,
          background: editMode ? '#1e1e2e' : '#4f46e5',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}>
          <span style={{ color: '#fff', fontFamily: 'sans-serif', fontWeight: 600, fontSize: '13px' }}>
            {editMode
              ? 'Edit Mode — click any dashed element to edit, then save'
              : 'Welcome back — click Edit Site to make changes'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {editMode && (
              <button onClick={handleSave} disabled={saving}
                style={{ ...mkBtn(saving ? 'gray' : 'green'), fontWeight: 700, fontSize: '13px', padding: '7px 18px' }}>
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            )}
            <button onClick={() => setEditMode(e => !e)}
              style={{ ...mkBtn(editMode ? 'red' : 'white'), fontWeight: 700, fontSize: '13px', padding: '7px 18px' }}>
              {editMode ? 'Exit Edit Mode' : 'Edit Site'}
            </button>
          </div>
        </div>
      )}

      <div style={{ paddingTop: canEdit ? '48px' : '0' }}>
        <div style={S.page}>

          {/* ── NAV ── */}
          <header style={{ ...S.nav, top: canEdit ? '48px' : '0' }}>
            <a href="#" style={S.navBrand}>
              {c.logoUrl && (
                <EditableImage src={c.logoUrl} alt={siteName + ' logo'}
                  onChange={v => set('logoUrl', v)} editMode={editMode}
                  imgStyle={{ height: '32px', objectFit: 'contain' }} />
              )}
              {siteName}
            </a>
            <nav style={S.navLinks}>
              {(c.services || []).length > 0 && <a href="#services" style={S.navLink}>Services</a>}
              <a href="#about"   style={S.navLink}>About</a>
              <a href="#contact" style={S.navLink}>Contact</a>
            </nav>
          </header>

          {/* ── HERO ── */}
          <section style={S.hero}>
            <h1 style={S.h1}>
              <EditableText tag="span" value={c.heroHeadline} placeholder="Add a headline..."
                onChange={v => set('heroHeadline', v)} editMode={editMode} style={{}} />
            </h1>
            {(c.heroSubheadline || editMode) && (
              <p style={S.sub}>
                <EditableText tag="span" value={c.heroSubheadline} placeholder="Add a subheadline..."
                  onChange={v => set('heroSubheadline', v)} editMode={editMode} style={{}} />
              </p>
            )}
            {(c.heroImageUrl || editMode) && (
              <EditableImage src={c.heroImageUrl} alt={siteName + ' hero image'}
                onChange={v => set('heroImageUrl', v)} editMode={editMode}
                imgStyle={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block', marginTop: '2rem', borderRadius: '8px' }} />
            )}
          </section>

          <hr style={S.hr} />

          {/* ── SERVICES ── */}
          {(c.services || []).length > 0 && (
            <>
              <section id="services" style={S.section}>
                <h2 style={S.eyebrow}>Services</h2>
                <div style={S.grid}>
                  {c.services.map((svc, i) => (
                    <div key={i} style={S.card}>
                      <p style={S.cardTitle}>
                        <EditableText tag="span" value={svc.title} placeholder={'Service ' + (i + 1)}
                          onChange={v => { const u = [...c.services]; u[i] = { ...u[i], title: v }; set('services', u) }}
                          editMode={editMode} style={{}} />
                      </p>
                      <p style={S.cardDesc}>
                        <EditableText tag="span" value={svc.description} placeholder="Description..."
                          onChange={v => { const u = [...c.services]; u[i] = { ...u[i], description: v }; set('services', u) }}
                          editMode={editMode} style={{}} />
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              <hr style={S.hr} />
            </>
          )}

          {/* ── ABOUT ── */}
          <section id="about" style={S.section}>
            <h2 style={S.eyebrow}>About</h2>
            <p style={S.body}>
              <EditableText tag="span" value={c.aboutText} placeholder="Tell visitors about your business..."
                onChange={v => set('aboutText', v)} editMode={editMode} style={{}} />
            </p>
          </section>

          <hr style={S.hr} />

          {/* ── CONTACT ── */}
          <section id="contact" style={S.section}>
            <h2 style={S.eyebrow}>Contact</h2>
            <div style={S.contactRow}>
              <span>
                {c.contactPhone || editMode
                  ? <EditableText tag="span" value={c.contactPhone} placeholder="+1 (555) 000-0000"
                      onChange={v => set('contactPhone', v)} editMode={editMode} style={{}} />
                  : null}
              </span>
              <span>
                {c.contactEmail || editMode
                  ? <EditableText tag="span" value={c.contactEmail} placeholder="hello@yourbusiness.com"
                      onChange={v => set('contactEmail', v)} editMode={editMode} style={{}} />
                  : null}
              </span>
              <span>
                {c.contactAddress || editMode
                  ? <EditableText tag="span" value={c.contactAddress} placeholder="123 Main St, City, State"
                      onChange={v => set('contactAddress', v)} editMode={editMode} style={{}} />
                  : null}
              </span>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer style={S.footer}>
            {siteName} &mdash; Powered by CMS-V1
          </footer>

        </div>
      </div>
    </>
  )
}

// ─── Server-side: fetch content + check session ───────────────────────────────
export async function getServerSideProps(context) {
  const { slug } = context.params
  const session  = await getSession(context)

  try {
    await dbConnect()

    const tenant = await Tenant.findOne({ slug }).lean()
    if (!tenant) return { props: { notFound: true, tenant: null, c: null, canEdit: false, slug } }

    const raw = await SiteContent.findOne({ tenantId: tenant._id }).lean()

    const c = raw ? {
      businessName:    raw.businessName    || '',
      heroHeadline:    raw.heroHeadline    || '',
      heroSubheadline: raw.heroSubheadline || '',
      aboutText:       raw.aboutText       || '',
      services:       (raw.services || []).map(s => ({ title: s.title || '', description: s.description || '' })),
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

    const canEdit = !!(
      session &&
      (session.user.role === 'admin' || session.user.siteSlug === slug)
    )

    return {
      props: {
        notFound: false,
        tenant: { name: tenant.name, slug: tenant.slug },
        c,
        canEdit,
        slug,
      }
    }
  } catch (err) {
    console.error('PublicSite error:', err.message)
    return { props: { notFound: true, tenant: null, c: null, canEdit: false, slug } }
  }
}
