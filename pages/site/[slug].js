import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { getSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import dbConnect from '../../lib/db'
import SiteContent from '../../lib/models/SiteContent'
import Tenant from '../../lib/models/Tenant'

// ─── EditSpan: inline text editor ────────────────────────────────────────────
function EditSpan({ value, onChange, multiline = false, style, darkBg = false }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(value || '')
  const inputRef              = useRef(null)

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
      <span
        style={{ ...style, cursor: 'pointer', outline: '2px dashed rgba(32,178,170,0.7)',
          outlineOffset: '3px', borderRadius: '3px', display: 'inline-block' }}
        title="Click to edit"
        onClick={() => { setDraft(value || ''); setEditing(true) }}
        dangerouslySetInnerHTML={{ __html: value || '<em style="opacity:0.45">Click to edit\u2026</em>' }}
      />
    )
  }

  const bg    = darkBg ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.95)'
  const color = darkBg ? '#fff' : '#111'
  const inputStyle = {
    background: bg, border: '2px solid #20b2aa', borderRadius: '4px',
    color, fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit',
    lineHeight: 'inherit', letterSpacing: 'inherit',
    padding: '4px 8px', width: '100%', boxSizing: 'border-box',
    outline: 'none', resize: multiline ? 'vertical' : 'none',
  }

  return (
    <span style={{ display: 'block' }}>
      {multiline ? (
        <textarea ref={inputRef} value={draft} rows={3}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') cancel() }}
          style={inputStyle} />
      ) : (
        <input ref={inputRef} type="text" value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirm() } if (e.key === 'Escape') cancel() }}
          style={inputStyle} />
      )}
      <span style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
        <button onMouseDown={e => { e.preventDefault(); confirm() }}
          style={{ background: '#20b2aa', color: '#fff', border: 'none', borderRadius: '4px',
            padding: '4px 12px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>\u2713 Apply</button>
        <button onMouseDown={e => { e.preventDefault(); cancel() }}
          style={{ background: 'rgba(0,0,0,0.1)', color: darkBg ? '#fff' : '#333', border: 'none',
            borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>\u2715</button>
      </span>
    </span>
  )
}

// ─── EditImage: inline image URL editor ──────────────────────────────────────
// Renders children normally. In edit mode, shows a click-to-edit overlay.
// On click, opens an inline panel with URL input + live preview.
function EditImage({ value, onChange, label = 'Image URL', darkBg = false, children, editMode }) {
  const [open, setOpen]   = useState(false)
  const [draft, setDraft] = useState(value || '')
  const inputRef          = useRef(null)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  // Keep draft in sync if parent resets
  const prevValue = useRef(value)
  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value
      if (!open) setDraft(value || '')
    }
  }, [value, open])

  const confirm = () => { onChange(draft); setOpen(false) }
  const cancel  = () => { setDraft(value || ''); setOpen(false) }

  if (!editMode) return <>{children}</>

  return (
    <div style={{ position: 'relative' }}>
      {children}
      {/* Edit trigger overlay */}
      {!open && (
        <button
          onClick={() => { setDraft(value || ''); setOpen(true) }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            background: 'rgba(13,45,74,0.82)', color: '#7ee8e4',
            border: '2px dashed rgba(32,178,170,0.8)', borderRadius: '8px',
            padding: '8px 18px', cursor: 'pointer',
            fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 700,
            backdropFilter: 'blur(2px)', zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          \uD83D\uDDBC\uFE0F Change {label}
        </button>
      )}
      {/* Inline editor panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          background: '#0d2d4a', border: '2px solid #20b2aa',
          borderRadius: '12px', padding: '1.25rem', zIndex: 20,
          width: 'min(380px, 90vw)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <p style={{ color: '#7ee8e4', fontFamily: 'sans-serif', fontSize: '12px',
            fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {label}
          </p>
          <input
            ref={inputRef}
            type="url"
            value={draft}
            placeholder="https://example.com/image.jpg"
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirm() } if (e.key === 'Escape') cancel() }}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(32,178,170,0.6)',
              borderRadius: '6px', color: '#fff', fontFamily: 'sans-serif',
              fontSize: '13px', padding: '8px 10px', outline: 'none',
            }}
          />
          {/* Live preview */}
          {draft && (
            <div style={{ marginTop: '10px', borderRadius: '6px', overflow: 'hidden',
              height: '80px', background: '#111' }}>
              <img src={draft} alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button onMouseDown={e => { e.preventDefault(); confirm() }}
              style={{ flex: 1, background: '#20b2aa', color: '#fff', border: 'none',
                borderRadius: '6px', padding: '8px', cursor: 'pointer',
                fontWeight: 700, fontSize: '13px', fontFamily: 'sans-serif' }}>\u2713 Apply</button>
            {value && (
              <button onMouseDown={e => { e.preventDefault(); onChange(''); setOpen(false) }}
                style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.4)',
                  borderRadius: '6px', padding: '8px 12px', cursor: 'pointer',
                  fontSize: '12px', fontFamily: 'sans-serif' }}>Remove</button>
            )}
            <button onMouseDown={e => { e.preventDefault(); cancel() }}
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none',
                borderRadius: '6px', padding: '8px 12px', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'sans-serif' }}>\u2715</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Service accent colours ───────────────────────────────────────────────────
const SERVICE_ACCENTS = [
  { bg: '#e8f4fd', border: '#1a5c8a', icon: '\uD83E\uDDB4' },
  { bg: '#e8f8f7', border: '#20b2aa', icon: '\u26A1' },
  { bg: '#eef6ff', border: '#4b7fa3', icon: '\uD83D\uDC89' },
  { bg: '#f0faf9', border: '#1a9a92', icon: '\uD83E\uDDEC' },
  { bg: '#fef9ee', border: '#d97706', icon: '\uD83E\uDE78' },
  { bg: '#f5f3ff', border: '#7c3aed', icon: '\uD83D\uDC8A' },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SiteEditor({ notFound, tenant, c: initialC, canEdit, slug }) {
  const [c, setC]               = useState(initialC || {})
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saveMsg, setSaveMsg]   = useState('')

  function set(field, value) {
    setC(prev => ({ ...prev, [field]: value }))
  }

  function setService(idx, field, value) {
    setC(prev => {
      const services = [...(prev.services || [])]
      services[idx] = { ...services[idx], [field]: value }
      return { ...prev, services }
    })
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
        setSaveMsg('\u2713 Saved!')
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

  const services = c.services || []

  // Hero background: if heroImageUrl is set, use it as a blended overlay
  const heroStyle = c.heroImageUrl
    ? {
        backgroundImage: `linear-gradient(135deg,rgba(13,45,74,0.88) 0%,rgba(26,92,138,0.82) 50%,rgba(14,74,110,0.88) 100%), url(${c.heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {}

  return (
    <>
      <Head>
        <title>{editMode ? '\u270F\uFE0F Editing \u2014 ' : ''}{c.seoTitle || tenant.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', sans-serif; background: #fff; color: #1a1a1a; }
          a { text-decoration: none; }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 clamp(1.5rem,5vw,3rem); }

          /* NAV */
          .apex-nav {
            position: sticky; top: 0; z-index: 100;
            background: #fff; border-bottom: 1px solid #e5e7eb;
            padding: 0 clamp(1.5rem,5vw,3rem);
            display: flex; align-items: center; justify-content: space-between;
            height: 68px;
          }
          .apex-nav__logo { display: flex; align-items: center; gap: 10px; }
          .apex-nav__logo-tile {
            width: 36px; height: 36px; border-radius: 7px;
            background: linear-gradient(180deg,#1e7a8c,#0e4a6e);
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
            overflow: hidden;
          }
          .apex-nav__wordmark { display: flex; flex-direction: column; line-height: 1.1; }
          .apex-nav__apex { font-size: 0.95rem; font-weight: 800; letter-spacing: 0.1em; color: #0d3b5e; }
          .apex-nav__sub  { font-size: 0.65rem; font-weight: 500; color: #4b7fa3; letter-spacing: 0.04em; text-transform: uppercase; }
          .apex-nav__links { display: flex; align-items: center; gap: 2rem; list-style: none; }
          .apex-nav__links a { font-size: 0.875rem; font-weight: 500; color: #374151; }
          .btn-nav { background: #20b2aa; color: #fff; border-radius: 50px; padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 600; }

          /* HERO */
          .apex-hero {
            position: relative; min-height: 100vh;
            background: linear-gradient(135deg,#0d2d4a 0%,#1a5c8a 50%,#0e4a6e 100%);
            display: flex; align-items: center; overflow: hidden;
          }
          .apex-hero__bg {
            position: absolute; inset: 0;
            background-image: radial-gradient(ellipse at 70% 50%,rgba(30,122,140,0.25) 0%,transparent 60%);
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
            font-size: clamp(2.5rem,6vw,4rem); font-weight: 800; line-height: 1.1;
            color: #fff; margin-bottom: 1.25rem; max-width: 14ch;
          }
          .apex-hero__sub {
            font-size: clamp(1rem,2vw,1.2rem); line-height: 1.7; color: rgba(255,255,255,0.82);
            max-width: 52ch; margin-bottom: 2.25rem;
          }
          .apex-hero__actions { display: flex; gap: 1rem; flex-wrap: wrap; }
          .btn-primary { background: #20b2aa; color: #fff; border-radius: 50px; padding: 0.85rem 2rem; font-size: 1rem; font-weight: 600; border: none; cursor: pointer; display: inline-block; }
          .btn-ghost { background: transparent; color: #fff; border-radius: 50px; padding: 0.85rem 2rem; font-size: 1rem; font-weight: 600; border: 2px solid rgba(255,255,255,0.45); cursor: pointer; display: inline-block; }

          /* TRUST BAR */
          .trust-bar { background: #0d2d4a; padding: 1rem 0; overflow: hidden; }
          .trust-bar__list { display: flex; gap: 3rem; align-items: center; list-style: none;
            animation: trustScroll 22s linear infinite; width: max-content; }
          .trust-bar__item { display: flex; align-items: center; gap: 0.5rem;
            font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.75); white-space: nowrap; }
          @keyframes trustScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

          /* SECTION SHARED */
          .section { padding: clamp(4rem,8vw,6rem) 0; }
          .section__eyebrow { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #20b2aa; margin-bottom: 0.75rem; }
          .section__heading { font-size: clamp(1.6rem,4vw,2.4rem); font-weight: 800; color: #0d3b5e; margin-bottom: 1rem; line-height: 1.2; }
          .section__subtext { color: #6b7280; line-height: 1.7; max-width: 56ch; }
          .section__header { text-align: center; margin-bottom: 3rem; }
          .section__header .section__subtext { margin: 0 auto; }
          .section-divider { border: none; border-top: 1px solid #f3f4f6; margin: 0; }

          /* SERVICES GRID */
          .services__grid { display: grid; list-style: none; grid-template-columns: repeat(auto-fit,minmax(300px,1fr)); gap: 1.5rem; }
          .service-card { border-radius: 12px; padding: 2rem; border-left: 4px solid var(--card-border); background: var(--card-bg); transition: transform 0.2s, box-shadow 0.2s; }
          .service-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
          .service-card__icon { font-size: 1.75rem; margin-bottom: 1rem; }
          .service-card__title { font-size: 1.05rem; font-weight: 700; color: #0d3b5e; margin-bottom: 0.5rem; }
          .service-card__desc { font-size: 0.9rem; color: #6b7280; line-height: 1.6; }
          .services__cta { text-align: center; margin-top: 2.5rem; }

          /* ABOUT TEASER */
          .teaser__inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
          @media (max-width: 768px) { .teaser__inner { grid-template-columns: 1fr; gap: 2rem; } }
          .teaser__body { color: #6b7280; line-height: 1.75; margin: 1rem 0 1.75rem; }
          .teaser__stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
          .stat { background: #f8fafc; border-radius: 12px; padding: 1.5rem; text-align: center; }
          .stat__number { display: block; font-size: clamp(1.75rem,4vw,2.5rem); font-weight: 800; color: #1a5c8a; }
          .stat__label { font-size: 0.8rem; color: #6b7280; font-weight: 500; margin-top: 0.25rem; display: block; }

          /* CONTACT */
          .contact__grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 3rem; align-items: start; }
          @media (max-width: 768px) { .contact__grid { grid-template-columns: 1fr; } }
          .contact-info__title { font-size: 1.1rem; font-weight: 700; color: #0d3b5e; margin-bottom: 1.25rem; }
          .contact-info__list { list-style: none; display: flex; flex-direction: column; gap: 1.25rem; }
          .contact-info__label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #20b2aa; display: block; margin-bottom: 0.25rem; }
          .contact-info__list p, .contact-info__list a { color: #374151; font-size: 0.95rem; line-height: 1.5; }
          .contact-form-wrap { background: #f8fafc; border-radius: 16px; padding: 2rem; }
          .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .form-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
          .form-group label { font-size: 0.8rem; font-weight: 600; color: #374151; }
          .form-group input, .form-group select, .form-group textarea { border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0.65rem 0.9rem; font-size: 0.9rem; font-family: inherit; color: #111; background: #fff; }
          .form-group textarea { min-height: 100px; resize: vertical; }
          .form-submit { background: #20b2aa; color: #fff; border: none; border-radius: 50px; padding: 0.85rem 2rem; font-size: 1rem; font-weight: 600; cursor: pointer; width: 100%; margin-top: 0.5rem; }

          /* FOOTER */
          .site-footer { background: #0d2d4a; color: rgba(255,255,255,0.7); padding: 4rem 0 2rem; }
          .footer__main { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 3rem; margin-bottom: 3rem; }
          @media (max-width: 768px) { .footer__main { grid-template-columns: 1fr 1fr; gap: 2rem; } }
          .footer__brand-name { font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; }
          .footer__tagline { font-size: 0.85rem; line-height: 1.6; max-width: 28ch; }
          .footer__col-heading { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #7ee8e4; margin-bottom: 1rem; }
          .footer__links { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
          .footer__links a { font-size: 0.875rem; color: rgba(255,255,255,0.6); }
          .footer__bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
          .footer__bottom p { font-size: 0.8rem; }
          .footer__legal { display: flex; gap: 1.5rem; }
          .footer__legal a { font-size: 0.8rem; color: rgba(255,255,255,0.5); }

          /* IMAGE EDIT HINT in edit mode */
          .img-edit-zone { position: relative; cursor: pointer; }
        `}</style>
      </Head>

      {/* CMS TOOLBAR */}
      {canEdit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
          background: editMode ? '#0d2d4a' : '#1a5c8a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 24px', boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#7ee8e4', fontFamily: 'sans-serif', fontWeight: 700, fontSize: '13px' }}>CMS</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'sans-serif', fontSize: '12px' }}>
              {editMode ? 'Click any outlined element or \uD83D\uDDBC\uFE0F button to edit. Save & Exit when done.' : 'Previewing ' + tenant.name}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {saveMsg && <span style={{ color: '#7ee8e4', fontFamily: 'sans-serif', fontSize: '13px', fontWeight: 600 }}>{saveMsg}</span>}
            {editMode ? (
              <>
                <button onClick={handleDiscard}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px', padding: '7px 16px', cursor: 'pointer', fontSize: '13px', fontFamily: 'sans-serif' }}>
                  Discard
                </button>
                <button onClick={handleSaveAndExit} disabled={saving}
                  style={{ background: saving ? '#555' : '#20b2aa', color: '#fff', border: 'none',
                    borderRadius: '6px', padding: '7px 18px', cursor: 'pointer', fontSize: '13px', fontFamily: 'sans-serif', fontWeight: 700 }}>
                  {saving ? 'Saving\u2026' : 'Save & Exit'}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditMode(true)}
                  style={{ background: '#20b2aa', color: '#fff', border: 'none', borderRadius: '6px',
                    padding: '7px 18px', cursor: 'pointer', fontSize: '13px', fontFamily: 'sans-serif', fontWeight: 700 }}>
                  \u270F\uFE0F Edit Site
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

      {/* PAGE CANVAS */}
      <div style={{ paddingTop: canEdit ? '46px' : '0' }}>

        {/* NAV */}
        <header className="apex-nav">
          <a className="apex-nav__logo" href="#">
            {/* Logo tile: shows custom logo image if set, otherwise default SVG */}
            <EditImage
              value={c.logoUrl}
              onChange={v => set('logoUrl', v)}
              label="Logo Image"
              editMode={editMode}
            >
              <div className="apex-nav__logo-tile">
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
                    <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e7a8c"/><stop offset="100%" stopColor="#0e4a6e"/></linearGradient></defs>
                    <rect width="36" height="36" rx="7" fill="url(#tg)"/>
                    <g transform="translate(3,3) scale(0.0619)">
                      <path fill="white" d="M391.745,114.138c-0.769-1.032-1.965-1.659-3.251-1.706c-0.367-0.014-35.121-1.422-51.205-12.485c3.222-8.449,9.949-28.502,5.212-37.722c-1.381-2.689-3.611-4.463-6.449-5.131c-5.178-1.218-11.607-1.598-17.826-1.965c-6.818-0.402-14.374-0.848-18.805-2.454l9.026-25.79c0.446-1.274,0.26-2.684-0.5-3.799c-0.761-1.115-2.006-1.802-3.355-1.852c-0.788-0.029-79.312-3.105-123.326-20.853c-0.274-0.111-0.56-0.192-0.851-0.244C180.182,0.096,179.534,0,178.565,0c-3.549,0-15.517,1.498-20.512,20.766c-1.353,5.217-2.554,10.132-3.715,14.885c-3.186,13.042-6.195,25.359-11.495,40.2c-1.017,2.847-1.983,5.368-2.837,7.592c-3.173,8.275-5.088,13.271-2.841,18.025c2.019,4.272,6.726,6.545,14.173,9.027c6.715,2.238,19.115,2.331,34.815,2.447c26.736,0.199,63.316,0.47,81.36,12.918c0.808,0.686,2.686,1.995,5.263,1.995c8.389,0,11.413-12.35,12.779-23.575c4.569,1.318,12.032,4.512,17.67,12.029c0.326,0.436,0.646,0.873,0.965,1.312c6.734,9.229,13.697,18.771,77.842,25.898c0.159,0.018,0.316,0.026,0.473,0.026c1.916,0,3.623-1.295,4.112-3.188l5.836-22.617C392.775,116.495,392.514,115.17,391.745,114.138z"/>
                    </g>
                  </svg>
                )}
              </div>
            </EditImage>
            <div className="apex-nav__wordmark">
              <span className="apex-nav__apex">APEX</span>
              <span className="apex-nav__sub">Pain Clinic</span>
            </div>
          </a>
          <ul className="apex-nav__links">
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a className="btn-nav" href="#contact">Book Appointment</a></li>
          </ul>
        </header>

        {/* HERO */}
        <EditImage
          value={c.heroImageUrl}
          onChange={v => set('heroImageUrl', v)}
          label="Hero Background"
          editMode={editMode}
        >
          <section className="apex-hero" style={heroStyle}>
            <div className="apex-hero__bg" />
            <div className="apex-hero__content">
              <p className="apex-hero__eyebrow">Board-Certified Pain Management</p>
              {editMode ? (
                <div className="apex-hero__heading">
                  <EditSpan value={c.heroHeadline} onChange={v => set('heroHeadline', v)} darkBg style={{ display: 'block' }} />
                </div>
              ) : (
                <h1 className="apex-hero__heading"
                  dangerouslySetInnerHTML={{ __html: c.heroHeadline || 'Reclaim Your Life<br>From Chronic Pain' }} />
              )}
              {editMode ? (
                <p className="apex-hero__sub">
                  <EditSpan value={c.heroSubheadline} onChange={v => set('heroSubheadline', v)} multiline darkBg />
                </p>
              ) : (
                <p className="apex-hero__sub">{c.heroSubheadline || 'Personalized, compassionate care combining advanced interventional techniques with holistic treatment plans.'}</p>
              )}
              <div className="apex-hero__actions">
                {editMode ? (
                  <span style={{ display: 'inline-block' }}>
                    <EditSpan value={c.heroCtaText} onChange={v => set('heroCtaText', v)} darkBg
                      style={{ background: '#20b2aa', color: '#fff', borderRadius: '50px', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 600 }} />
                  </span>
                ) : (
                  <a className="btn-primary" href="#contact">{c.heroCtaText || 'Book a Consultation'}</a>
                )}
                <a className="btn-ghost" href="#services">Our Services</a>
              </div>
            </div>
          </section>
        </EditImage>

        {/* TRUST BAR */}
        <section className="trust-bar" aria-hidden="true">
          <ul className="trust-bar__list">
            {['Board-Certified Physicians','Accepting New Patients','Most Insurance Accepted','Same-Week Appointments',
              'Board-Certified Physicians','Accepting New Patients','Most Insurance Accepted','Same-Week Appointments'].map((t,i) => (
              <li key={i} className="trust-bar__item">\u2726 {t}</li>
            ))}
          </ul>
        </section>

        {/* SERVICES */}
        <section className="section" id="services" style={{ background: '#fff' }}>
          <div className="container">
            <div className="section__header">
              <p className="section__eyebrow">What We Treat</p>
              <h2 className="section__heading">Comprehensive Pain Management</h2>
              <p className="section__subtext">We offer a full spectrum of interventional and non-interventional treatments tailored to your condition and lifestyle.</p>
            </div>
            <ul className="services__grid">
              {services.map((svc, i) => {
                const accent = SERVICE_ACCENTS[i % SERVICE_ACCENTS.length]
                return (
                  <li key={i} className="service-card" style={{ '--card-bg': accent.bg, '--card-border': accent.border }}>
                    <div className="service-card__icon">{accent.icon}</div>
                    {editMode ? (
                      <>
                        <div className="service-card__title">
                          <EditSpan value={svc.title} onChange={v => setService(i, 'title', v)} />
                        </div>
                        <div className="service-card__desc" style={{ marginTop: '0.5rem' }}>
                          <EditSpan value={svc.description} onChange={v => setService(i, 'description', v)} multiline />
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="service-card__title">{svc.title}</h3>
                        <p className="service-card__desc">{svc.description}</p>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className="services__cta">
              <a className="btn-primary" href="#contact">Book a Consultation</a>
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        {/* ABOUT */}
        <section className="section" id="about" style={{ background: '#f8fafc' }}>
          <div className="container">
            <div className="teaser__inner">
              <div>
                <p className="section__eyebrow">About the Clinic</p>
                <h2 className="section__heading">Compassionate Experts Dedicated to Your Recovery</h2>
                {editMode ? (
                  <div className="teaser__body">
                    <EditSpan value={c.aboutText} onChange={v => set('aboutText', v)} multiline />
                  </div>
                ) : (
                  <p className="teaser__body">{c.aboutText || 'Founded by fellowship-trained pain specialists, Apex Pain Clinic brings together cutting-edge interventional techniques and whole-patient care. We treat the cause \u2014 not just the symptom.'}</p>
                )}
                <a className="btn-primary" href="#contact">Learn About Us</a>
              </div>
              <div className="teaser__stats">
                <div className="stat"><span className="stat__number">1,200+</span><span className="stat__label">Patients Treated Annually</span></div>
                <div className="stat"><span className="stat__number">15+</span><span className="stat__label">Years of Combined Experience</span></div>
                <div className="stat"><span className="stat__number">94%</span><span className="stat__label">Patient Satisfaction Rate</span></div>
                <div className="stat"><span className="stat__number">6</span><span className="stat__label">Specialized Treatment Types</span></div>
              </div>
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        {/* CONTACT */}
        <section className="section" id="contact" style={{ background: '#fff' }}>
          <div className="container">
            <div className="section__header">
              <p className="section__eyebrow">Get in Touch</p>
              <h2 className="section__heading">Book Your Appointment</h2>
              <p className="section__subtext">Ready to start your path to relief? Fill out the form below and our team will reach out within one business day.</p>
            </div>
            <div className="contact__grid">
              <div>
                <h3 className="contact-info__title">Clinic Information</h3>
                <ul className="contact-info__list">
                  <li>
                    <span className="contact-info__label">Address</span>
                    {editMode ? (
                      <EditSpan value={c.contactAddress} onChange={v => set('contactAddress', v)} multiline />
                    ) : (
                      <p dangerouslySetInnerHTML={{ __html: (c.contactAddress || '123 Wellness Blvd, Suite 400<br>Miami, FL 33101').replace(/\n/g,'<br>') }} />
                    )}
                  </li>
                  <li>
                    <span className="contact-info__label">Phone</span>
                    {editMode ? (
                      <EditSpan value={c.contactPhone} onChange={v => set('contactPhone', v)} />
                    ) : (
                      <p><a href={`tel:${(c.contactPhone||'').replace(/\D/g,'')}`}>{c.contactPhone || '(305) 555-0100'}</a></p>
                    )}
                  </li>
                  <li>
                    <span className="contact-info__label">Email</span>
                    {editMode ? (
                      <EditSpan value={c.contactEmail} onChange={v => set('contactEmail', v)} />
                    ) : (
                      <p><a href={`mailto:${c.contactEmail || 'info@apexpainclinic.com'}`}>{c.contactEmail || 'info@apexpainclinic.com'}</a></p>
                    )}
                  </li>
                  <li>
                    <span className="contact-info__label">Hours</span>
                    <p>Monday \u2013 Friday: 8 AM \u2013 5 PM<br />Saturday: 9 AM \u2013 1 PM</p>
                  </li>
                </ul>
              </div>
              <div className="contact-form-wrap">
                <div className="form-row">
                  <div className="form-group"><label>First Name</label><input type="text" placeholder="Jane" disabled /></div>
                  <div className="form-group"><label>Last Name</label><input type="text" placeholder="Smith" disabled /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Email</label><input type="email" placeholder="jane@email.com" disabled /></div>
                  <div className="form-group"><label>Phone</label><input type="tel" placeholder="(305) 555-0000" disabled /></div>
                </div>
                <div className="form-group">
                  <label>Service of Interest</label>
                  <select disabled><option>Select a service\u2026</option></select>
                </div>
                <div className="form-group">
                  <label>Tell Us About Your Pain</label>
                  <textarea placeholder="Briefly describe your pain\u2026" disabled />
                </div>
                <button className="form-submit" disabled>Send Request</button>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem', textAlign: 'center' }}>
                  Form preview only \u2014 submissions active on the live site.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="site-footer">
          <div className="container">
            <div className="footer__main">
              <div>
                <p className="footer__brand-name">{c.businessName || 'Apex Pain Clinic'}</p>
                <p className="footer__tagline">Compassionate, expert pain care \u2014 helping patients reclaim their lives.</p>
              </div>
              <div>
                <p className="footer__col-heading">Services</p>
                <ul className="footer__links">
                  {services.slice(0,5).map((s,i) => <li key={i}><a href="#services">{s.title}</a></li>)}
                </ul>
              </div>
              <div>
                <p className="footer__col-heading">Company</p>
                <ul className="footer__links">
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#contact">Book Appointment</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>
              <div>
                <p className="footer__col-heading">Contact</p>
                <ul className="footer__links">
                  <li><a href={`tel:${(c.contactPhone||'').replace(/\D/g,'')}`}>{c.contactPhone || '(305) 555-0100'}</a></li>
                  <li><a href={`mailto:${c.contactEmail||'info@apexpainclinic.com'}`}>{c.contactEmail || 'info@apexpainclinic.com'}</a></li>
                </ul>
              </div>
            </div>
            <div className="footer__bottom">
              <p>\u00A9 2026 {c.businessName || 'Apex Pain Clinic'}. All rights reserved.</p>
              <nav className="footer__legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Use</a>
                <a href="#">Accessibility</a>
              </nav>
            </div>
          </div>
        </footer>

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
