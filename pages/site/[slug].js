import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { getSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import dbConnect from '../../lib/db'
import SiteContent from '../../lib/models/SiteContent'
import Tenant from '../../lib/models/Tenant'

// ─── Inline editable span ─────────────────────────────────────────────────────
// Click to edit, Escape to cancel, Enter to confirm (single-line).
// Changes are held locally and only committed to parent state on confirm.
function EditSpan({ value, onChange, multiline = false, className, style, tag: Tag = 'span' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value || '')
  const inputRef              = useRef(null)

  // Sync draft when parent resets (e.g. cancel all)
  const prevValue = useRef(value)
  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value
      if (!editing) setDraft(value || '')
    }
  }, [value, editing])

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const confirm = () => { onChange(draft); setEditing(false) }
  const cancel  = () => { setDraft(value || ''); setEditing(false) }

  if (!editing) {
    return (
      <Tag
        className={className}
        style={{
          ...style,
          cursor: 'pointer',
          outline: '2px dashed rgba(126,232,228,0.6)',
          outlineOffset: '3px',
          borderRadius: '3px',
          position: 'relative',
        }}
        title="Click to edit"
        onClick={() => { setDraft(value || ''); setEditing(true) }}
        dangerouslySetInnerHTML={{ __html: value || '<em style="opacity:0.5">Click to edit…</em>' }}
      />
    )
  }

  const inputStyle = {
    background: 'rgba(0,0,0,0.55)',
    border: '2px solid #7ee8e4',
    borderRadius: '4px',
    color: '#fff',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    letterSpacing: 'inherit',
    padding: '4px 8px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    resize: multiline ? 'vertical' : 'none',
  }

  return (
    <span style={{ display: 'block', position: 'relative' }}>
      {multiline ? (
        <textarea
          ref={inputRef}
          value={draft}
          rows={3}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') cancel() }}
          style={inputStyle}
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); confirm() }
            if (e.key === 'Escape') cancel()
          }}
          style={inputStyle}
        />
      )}
      <span style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        <button
          onMouseDown={e => { e.preventDefault(); confirm() }}
          style={{ background: '#7ee8e4', color: '#0d3b5e', border: 'none', borderRadius: '4px',
            padding: '4px 12px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
          ✓ Apply
        </button>
        <button
          onMouseDown={e => { e.preventDefault(); cancel() }}
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none',
            borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
          ✕
        </button>
      </span>
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SiteEditor({ notFound, tenant, c: initialC, canEdit, slug }) {
  const [c, setC]           = useState(initialC || {})
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  function set(field, value) {
    setC(prev => ({ ...prev, [field]: value }))
  }

  async function handleSaveAndExit() {
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch(`/api/site-content/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      })
      if (res.ok) {
        setSaveMsg('✓ Saved!')
        setEditMode(false)
        setTimeout(() => setSaveMsg(''), 3000)
      } else {
        const err = await res.json().catch(() => ({}))
        alert('Save failed: ' + (err.error || res.statusText))
      }
    } catch (err) {
      alert('Network error: ' + err.message)
    }
    setSaving(false)
  }

  function handleDiscard() {
    setC(initialC || {})
    setEditMode(false)
  }

  if (notFound || !tenant) {
    return (
      <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#444' }}>
        <h1>404</h1><p>This site does not exist yet.</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{editMode ? '✏️ Editing — ' : ''}{c.seoTitle || tenant.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Apex fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', sans-serif; background: #fff; color: #1a1a1a; }
          a { text-decoration: none; }

          /* ── NAV ── */
          .apex-nav {
            position: sticky; top: 0; z-index: 100;
            background: #fff; border-bottom: 1px solid #e5e7eb;
            padding: 0 clamp(1.5rem, 5vw, 3rem);
            display: flex; align-items: center; justify-content: space-between;
            height: 68px;
          }
          .apex-nav__logo { display: flex; align-items: center; gap: 10px; }
          .apex-nav__logo-tile {
            width: 36px; height: 36px; border-radius: 7px;
            background: linear-gradient(180deg,#1e7a8c,#0e4a6e);
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .apex-nav__wordmark { display: flex; flex-direction: column; line-height: 1.1; }
          .apex-nav__apex { font-size: 0.95rem; font-weight: 800; letter-spacing: 0.1em; color: #0d3b5e; }
          .apex-nav__sub  { font-size: 0.65rem; font-weight: 500; color: #4b7fa3; letter-spacing: 0.04em; text-transform: uppercase; }
          .apex-nav__links { display: flex; align-items: center; gap: 2rem; list-style: none; }
          .apex-nav__links a { font-size: 0.875rem; font-weight: 500; color: #374151; }
          .apex-nav__links a:hover { color: #1a5c8a; }
          .btn-nav {
            background: #20b2aa; color: #fff; border-radius: 50px;
            padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 600;
          }
          .btn-nav:hover { background: #1a9a92; }

          /* ── HERO ── */
          .apex-hero {
            position: relative; min-height: 100vh;
            background: linear-gradient(135deg, #0d2d4a 0%, #1a5c8a 50%, #0e4a6e 100%);
            display: flex; align-items: center; overflow: hidden;
          }
          .apex-hero__bg {
            position: absolute; inset: 0;
            background-image: radial-gradient(ellipse at 70% 50%, rgba(30,122,140,0.25) 0%, transparent 60%);
            pointer-events: none;
          }
          .apex-hero__content {
            position: relative; z-index: 2;
            max-width: 1200px; margin: 0 auto; padding: clamp(5rem,10vw,9rem) clamp(1.5rem,5vw,3rem);
          }
          .apex-hero__eyebrow {
            font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em;
            text-transform: uppercase; color: #7ee8e4; margin-bottom: 1.25rem;
          }
          .apex-hero__heading {
            font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 800; line-height: 1.1;
            color: #fff; margin-bottom: 1.25rem; max-width: 14ch;
          }
          .apex-hero__sub {
            font-size: clamp(1rem, 2vw, 1.2rem); line-height: 1.7; color: rgba(255,255,255,0.82);
            max-width: 52ch; margin-bottom: 2.25rem;
          }
          .apex-hero__actions { display: flex; gap: 1rem; flex-wrap: wrap; }
          .btn-primary {
            background: #20b2aa; color: #fff; border-radius: 50px;
            padding: 0.85rem 2rem; font-size: 1rem; font-weight: 600; border: none; cursor: pointer;
            display: inline-block;
          }
          .btn-primary:hover { background: #1a9a92; }
          .btn-ghost {
            background: transparent; color: #fff; border-radius: 50px;
            padding: 0.85rem 2rem; font-size: 1rem; font-weight: 600;
            border: 2px solid rgba(255,255,255,0.45); cursor: pointer; display: inline-block;
          }
          .btn-ghost:hover { border-color: #fff; }

          /* ── EDIT MODE highlights ── */
          .edit-mode-active .editable-hint::after {
            content: ' ✏️';
            font-size: 0.7em;
            opacity: 0.7;
          }
        `}</style>
      </Head>

      {/* ── CMS TOOLBAR ── */}
      {canEdit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
          background: editMode ? '#0d2d4a' : '#1a5c8a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 24px', boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#7ee8e4', fontFamily: 'sans-serif', fontWeight: 700, fontSize: '13px' }}>
              CMS
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'sans-serif', fontSize: '12px' }}>
              {editMode
                ? 'Click any highlighted element to edit. Save & Exit when done.'
                : 'You are previewing ' + tenant.name}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {saveMsg && (
              <span style={{ color: '#7ee8e4', fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 600 }}>
                {saveMsg}
              </span>
            )}
            {editMode ? (
              <>
                <button onClick={handleDiscard}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px', padding: '7px 16px', cursor: 'pointer', fontSize: '13px', fontFamily: 'sans-serif' }}>
                  Discard Changes
                </button>
                <button onClick={handleSaveAndExit} disabled={saving}
                  style={{ background: saving ? '#555' : '#20b2aa', color: '#fff', border: 'none',
                    borderRadius: '6px', padding: '7px 18px', cursor: 'pointer', fontSize: '13px',
                    fontFamily: 'sans-serif', fontWeight: 700 }}>
                  {saving ? 'Saving…' : 'Save & Exit'}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditMode(true)}
                  style={{ background: '#20b2aa', color: '#fff', border: 'none',
                    borderRadius: '6px', padding: '7px 18px', cursor: 'pointer',
                    fontSize: '13px', fontFamily: 'sans-serif', fontWeight: 700 }}>
                  ✏️ Edit Site
                </button>
                <button onClick={() => signOut({ callbackUrl: '/login' })}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', fontFamily: 'sans-serif' }}>
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── PAGE CANVAS ── */}
      <div style={{ paddingTop: canEdit ? '46px' : '0' }} className={editMode ? 'edit-mode-active' : ''}>

        {/* NAV */}
        <header className="apex-nav">
          <a className="apex-nav__logo" href="#">
            <div className="apex-nav__logo-tile">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
                <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e7a8c"/><stop offset="100%" stopColor="#0e4a6e"/></linearGradient></defs>
                <rect width="36" height="36" rx="7" fill="url(#tg)"/>
                <g transform="translate(3,3) scale(0.0619)">
                  <path fill="white" d="M391.745,114.138c-0.769-1.032-1.965-1.659-3.251-1.706c-0.367-0.014-35.121-1.422-51.205-12.485c3.222-8.449,9.949-28.502,5.212-37.722c-1.381-2.689-3.611-4.463-6.449-5.131c-5.178-1.218-11.607-1.598-17.826-1.965c-6.818-0.402-14.374-0.848-18.805-2.454l9.026-25.79c0.446-1.274,0.26-2.684-0.5-3.799c-0.761-1.115-2.006-1.802-3.355-1.852c-0.788-0.029-79.312-3.105-123.326-20.853c-0.274-0.111-0.56-0.192-0.851-0.244C180.182,0.096,179.534,0,178.565,0c-3.549,0-15.517,1.498-20.512,20.766c-1.353,5.217-2.554,10.132-3.715,14.885c-3.186,13.042-6.195,25.359-11.495,40.2c-1.017,2.847-1.983,5.368-2.837,7.592c-3.173,8.275-5.088,13.271-2.841,18.025c2.019,4.272,6.726,6.545,14.173,9.027c6.715,2.238,19.115,2.331,34.815,2.447c26.736,0.199,63.316,0.47,81.36,12.918c0.808,0.686,2.686,1.995,5.263,1.995c8.389,0,11.413-12.35,12.779-23.575c4.569,1.318,12.032,4.512,17.67,12.029c0.326,0.436,0.646,0.873,0.965,1.312c6.734,9.229,13.697,18.771,77.842,25.898c0.159,0.018,0.316,0.026,0.473,0.026c1.916,0,3.623-1.295,4.112-3.188l5.836-22.617C392.775,116.495,392.514,115.17,391.745,114.138z"/>
                </g>
              </svg>
            </div>
            <div className="apex-nav__wordmark">
              <span className="apex-nav__apex">APEX</span>
              <span className="apex-nav__sub">Pain Clinic</span>
            </div>
          </a>
          <ul className="apex-nav__links">
            <li><a href="#">Services</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Our Team</a></li>
            <li><a href="#">Contact</a></li>
            <li><a className="btn-nav" href="#">Book Appointment</a></li>
          </ul>
        </header>

        {/* HERO */}
        <section className="apex-hero">
          <div className="apex-hero__bg" />
          <div className="apex-hero__content">
            <p className="apex-hero__eyebrow">Board-Certified Pain Management</p>

            {editMode ? (
              <div className="apex-hero__heading">
                <EditSpan
                  value={c.heroHeadline}
                  onChange={v => set('heroHeadline', v)}
                  tag="span"
                  style={{ display: 'block' }}
                />
              </div>
            ) : (
              <h1 className="apex-hero__heading"
                dangerouslySetInnerHTML={{ __html: c.heroHeadline || 'Reclaim Your Life<br>From Chronic Pain' }} />
            )}

            {editMode ? (
              <p className="apex-hero__sub">
                <EditSpan
                  value={c.heroSubheadline}
                  onChange={v => set('heroSubheadline', v)}
                  multiline
                />
              </p>
            ) : (
              <p className="apex-hero__sub">{c.heroSubheadline}</p>
            )}

            <div className="apex-hero__actions">
              {editMode ? (
                <span style={{ display: 'inline-block' }}>
                  <EditSpan
                    value={c.heroCtaText}
                    onChange={v => set('heroCtaText', v)}
                    style={{
                      display: 'inline-block',
                      background: '#20b2aa', color: '#fff', borderRadius: '50px',
                      padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 600,
                    }}
                  />
                </span>
              ) : (
                <a className="btn-primary" href="#">{c.heroCtaText || 'Book a Consultation'}</a>
              )}
              <a className="btn-ghost" href="#">Our Services</a>
            </div>
          </div>
        </section>

        {/* Placeholder for Phase 2 sections */}
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#9ca3af',
          fontFamily: 'sans-serif', fontSize: '0.9rem', borderTop: '1px solid #f3f4f6' }}>
          Services, About, Team, and Contact sections coming in Phase 2.
        </div>
      </div>
    </>
  )
}

// ─── Server-side ──────────────────────────────────────────────────────────────
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
      heroCtaText:     raw.heroCtaText     || 'Book a Consultation',
      heroCtaUrl:      raw.heroCtaUrl      || '#contact',
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
    } : {}

    const canEdit = !!(
      session &&
      (session.user.role === 'admin' || session.user.siteSlug === slug)
    )

    return {
      props: { notFound: false, tenant: { name: tenant.name, slug: tenant.slug }, c, canEdit, slug }
    }
  } catch (err) {
    console.error('SiteEditor error:', err.message)
    return { props: { notFound: true, tenant: null, c: null, canEdit: false, slug } }
  }
}
