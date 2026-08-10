import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { getSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import dbConnect from '../../lib/db'
import SiteContent from '../../lib/models/SiteContent'
import Tenant from '../../lib/models/Tenant'
import ImageUploadButton from '../../components/ImageUploadButton'

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
    const isEmpty = !value
    return (
      <span
        style={{ ...style, cursor: 'pointer', outline: '2px dashed rgba(32,178,170,0.7)',
          outlineOffset: '3px', borderRadius: '3px', display: 'inline-block',
          whiteSpace: multiline ? 'pre-wrap' : style?.whiteSpace,
          fontStyle: isEmpty ? 'italic' : style?.fontStyle,
          opacity: isEmpty ? 0.45 : style?.opacity }}
        title="Click to edit"
        onClick={() => { setDraft(value || ''); setEditing(true) }}
      >
        {isEmpty ? 'Click to edit…' : value}
      </span>
    )
  }

  const bg    = darkBg ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.95)'
  const color = darkBg ? '#fff' : '#111'
  const inputStyle = {
    background: bg, border: '2px solid #20b2aa', borderRadius: '4px',
    color, fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit',
    lineHeight: 'inherit', letterSpacing: 'inherit',
    padding: '4px 8px', width: '100%', boxSizing: 'border-box',
    resize: multiline ? 'vertical' : 'none',
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
            padding: '4px 12px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>&#10003; Apply</button>
        <button onMouseDown={e => { e.preventDefault(); cancel() }}
          style={{ background: 'rgba(0,0,0,0.1)', color: darkBg ? '#fff' : '#333', border: 'none',
            borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>&#10005;</button>
      </span>
    </span>
  )
}

// ─── EditImage: inline image URL editor ──────────────────────────────────────
function EditImage({ value, onChange, label = 'Image URL', children, editMode, variant = 'section' }) {
  const [open, setOpen]   = useState(false)
  const [draft, setDraft] = useState(value || '')
  const inputRef          = useRef(null)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

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

  const triggerStyle = variant === 'corner'
    ? {
        position: 'absolute', bottom: '-7px', right: '-7px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#20b2aa', border: '2px solid #fff', color: '#fff',
        fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 200, padding: 0, lineHeight: 1,
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }
    : {
        position: 'absolute', bottom: '1.75rem', right: '2rem',
        background: 'rgba(13,45,74,0.85)', color: '#7ee8e4',
        border: '1.5px solid rgba(32,178,170,0.7)', borderRadius: '50px',
        padding: '7px 16px', cursor: 'pointer', fontFamily: 'sans-serif',
        fontSize: '12px', fontWeight: 700, backdropFilter: 'blur(4px)',
        zIndex: 10, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center',
        gap: '6px', boxShadow: '0 2px 12px rgba(0,0,0,0.4)', letterSpacing: '0.02em',
      }

  const panelStyle = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    background: '#0d2d4a', border: '2px solid #20b2aa', borderRadius: '12px',
    padding: '1.25rem', zIndex: 20000, width: 'min(380px, 90vw)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  }

  return (
    <div style={{ position: 'relative' }}>
      {children}
      {!open && (
        <button onClick={() => { setDraft(value || ''); setOpen(true) }} style={triggerStyle} title={`Change ${label}`}>
          {variant === 'corner' ? '\u{1F5BC}' : <>{label}</>}
        </button>
      )}
      {open && (
        <div style={panelStyle}>
          <p style={{ color: '#7ee8e4', fontFamily: 'sans-serif', fontSize: '12px',
            fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {label}
          </p>
          <ImageUploadButton
            label="Upload from your computer"
            onUploaded={url => { onChange(url); setOpen(false) }}
            style={{
              width: '100%', boxSizing: 'border-box', background: '#20b2aa', color: '#fff',
              border: 'none', borderRadius: '6px', padding: '9px', fontWeight: 700,
              fontSize: '13px', fontFamily: 'sans-serif', marginBottom: '10px',
            }}
            errorStyle={{ display: 'block', fontSize: '11px', color: '#fca5a5', marginTop: '4px' }}
          />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', fontSize: '11px',
            textAlign: 'center', margin: '0 0 10px' }}>
            — or paste an image URL —
          </p>
          <input ref={inputRef} type="url" value={draft} placeholder="https://example.com/image.jpg"
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); confirm() }
              if (e.key === 'Escape') cancel()
            }}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(32,178,170,0.6)',
              borderRadius: '6px', color: '#fff', fontFamily: 'sans-serif',
              fontSize: '13px', padding: '8px 10px',
            }}
          />
          {draft && (
            <div style={{ marginTop: '10px', borderRadius: '6px', overflow: 'hidden', height: '80px', background: '#111' }}>
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
                fontWeight: 700, fontSize: '13px', fontFamily: 'sans-serif' }}>&#10003; Apply</button>
            {value && (
              <button onMouseDown={e => { e.preventDefault(); onChange(''); setOpen(false) }}
                style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.4)', borderRadius: '6px',
                  padding: '8px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: 'sans-serif' }}>Remove</button>
            )}
            <button onMouseDown={e => { e.preventDefault(); cancel() }}
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none',
                borderRadius: '6px', padding: '8px 12px', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'sans-serif' }}>&#10005;</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Service accent colours ───────────────────────────────────────────────────
const SERVICE_ACCENTS = [
  { bg: '#e8f4fd', border: '#1a5c8a', icon: '&#129460;' },
  { bg: '#e8f8f7', border: '#20b2aa', icon: '&#9889;' },
  { bg: '#eef6ff', border: '#4b7fa3', icon: '&#128137;' },
  { bg: '#f0faf9', border: '#1a9a92', icon: '&#129516;' },
  { bg: '#fef9ee', border: '#d97706', icon: '&#129754;' },
  { bg: '#f5f3ff', border: '#7c3aed', icon: '&#128138;' },
]

// ─── Default stat fallbacks (generic, not Apex-specific) ─────────────────────
const DEFAULT_STATS = [
  { number: '', label: '' },
  { number: '', label: '' },
  { number: '', label: '' },
  { number: '', label: '' },
]

// ─── HTML escaping helper for the two fields that render as __html ───────────
// Escapes everything, then re-opens only a bare <br> so line breaks still work
// without allowing scripts, event handlers, or any other markup through.
function escapeAllowingBr(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SiteEditor({ notFound, tenant, c: initialC, canEdit, slug }) {
  const [c, setC]               = useState(initialC || {})
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saveMsg, setSaveMsg]   = useState('')
  const [navOpen, setNavOpen]   = useState(false)

  const toolbarRef = useRef(null)
  const [toolbarHeight, setToolbarHeight] = useState(58)

  useEffect(() => {
    const el = toolbarRef.current
    if (!canEdit || !el) return
    const measure = () => setToolbarHeight(el.getBoundingClientRect().height)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [canEdit])

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

  function setTeamMember(idx, field, value) {
    setC(prev => {
      const teamMembers = [...(prev.teamMembers || [])]
      teamMembers[idx] = { ...teamMembers[idx], [field]: value }
      return { ...prev, teamMembers }
    })
  }

  function setTestimonial(idx, field, value) {
    setC(prev => {
      const testimonials = [...(prev.testimonials || [])]
      testimonials[idx] = { ...testimonials[idx], [field]: value }
      return { ...prev, testimonials }
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
        setSaveMsg('Saved!')
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
  const teamMembers = c.teamMembers || []
  const testimonials = c.testimonials || []

  const heroStyle = c.heroImageUrl
    ? {
        backgroundImage: `linear-gradient(135deg,rgba(13,45,74,0.88) 0%,rgba(26,92,138,0.82) 50%,rgba(14,74,110,0.88) 100%), url(${c.heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {}

  const navSubtitle = c.navSubtitle || ''

  const statNumber = (n, def) => (n && n.trim()) ? n : def
  const statLabel  = (l, def) => (l && l.trim()) ? l : def

  const tbBtn = (variant = 'ghost') => {
    const base = {
      borderRadius: '8px', padding: '7px 16px', cursor: 'pointer',
      fontSize: '13px', fontWeight: 600, textDecoration: 'none',
      display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
      border: '1px solid transparent',
    }
    if (variant === 'primary') return { ...base, background: '#4f46e5', color: '#fff', borderColor: '#4f46e5' }
    if (variant === 'outline') return { ...base, background: '#fff', color: '#374151', borderColor: '#e5e7eb' }
    return { ...base, background: 'transparent', color: '#6b7280' } // ghost
  }

  return (
    <>
      <Head>
        <title>{editMode ? 'Editing — ' : ''}{c.seoTitle || tenant.name}</title>
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
            overflow: visible;
          }
          .apex-nav__wordmark { display: flex; flex-direction: column; line-height: 1.1; }
          .apex-nav__apex { font-size: 0.95rem; font-weight: 800; letter-spacing: 0.1em; color: #0d3b5e; }
          .apex-nav__sub  { font-size: 0.65rem; font-weight: 500; color: #4b7fa3; letter-spacing: 0.04em; text-transform: uppercase; }
          .apex-nav__links { display: flex; align-items: center; gap: 2rem; list-style: none; }
          .apex-nav__links a { font-size: 0.875rem; font-weight: 500; color: #374151; }
          .btn-nav { background: #20b2aa; color: #fff; border-radius: 50px; padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 600; }
          .apex-nav__toggle { display: none; background: none; border: none; cursor: pointer; padding: 8px; flex-shrink: 0; }
          .apex-nav__toggle-bar { display: block; width: 22px; height: 2px; background: #0d3b5e; border-radius: 2px; }
          .apex-nav__toggle-bar + .apex-nav__toggle-bar { margin-top: 5px; }
          @media (max-width: 768px) {
            .apex-nav__toggle { display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .apex-nav__links {
              display: none;
              position: absolute; top: 100%; left: 0; right: 0;
              background: #fff; border-bottom: 1px solid #e5e7eb;
              flex-direction: column; align-items: flex-start; gap: 0;
              padding: 0.5rem clamp(1.5rem,5vw,3rem) 1.25rem;
              box-shadow: 0 12px 24px rgba(13,45,74,0.1);
            }
            .apex-nav__links.is-open { display: flex; }
            .apex-nav__links li { width: 100%; }
            .apex-nav__links a { display: block; padding: 0.7rem 0; }
            .apex-nav__links .btn-nav { display: inline-block; margin-top: 0.4rem; }
          }

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
          .apex-hero__actions { display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-start; }
          .btn-primary { background: #20b2aa; color: #fff; border-radius: 50px; padding: 0.85rem 2rem; font-size: 1rem; font-weight: 600; border: none; cursor: pointer; display: inline-block; }
          .btn-ghost { background: transparent; color: #fff; border-radius: 50px; padding: 0.85rem 2rem; font-size: 1rem; font-weight: 600; border: 2px solid rgba(255,255,255,0.45); cursor: pointer; display: inline-block; }

          /* CTA URL edit hint */
          .cta-url-row { margin-top: 6px; display: flex; align-items: center; gap: 8px; }
          .cta-url-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #7ee8e4; white-space: nowrap; }

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

          /* TEAM */
          .team__grid { display: grid; list-style: none; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 2rem; }
          .team-card { text-align: center; }
          .team-card__photo {
            width: 96px; height: 96px; border-radius: 50%; margin: 0 auto 1rem; overflow: hidden;
            background: linear-gradient(180deg,#1e7a8c,#0e4a6e);
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 1.75rem; font-weight: 700;
          }
          .team-card__photo img { width: 100%; height: 100%; object-fit: cover; }
          .team-card__name { font-size: 1rem; font-weight: 700; color: #0d3b5e; margin-bottom: 0.2rem; }
          .team-card__title { font-size: 0.82rem; font-weight: 600; color: #20b2aa; margin-bottom: 0.6rem; }
          .team-card__bio { font-size: 0.88rem; color: #6b7280; line-height: 1.6; }

          /* TESTIMONIALS */
          .testimonials__grid { display: grid; list-style: none; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap: 1.5rem; }
          .testimonial-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.75rem; }
          .testimonial-card__quote { font-size: 0.95rem; color: #374151; line-height: 1.7; font-style: italic; margin-bottom: 1rem; }
          .testimonial-card__author { font-size: 0.9rem; font-weight: 700; color: #0d3b5e; }
          .testimonial-card__role { font-size: 0.8rem; color: #6b7280; margin-top: 0.1rem; }

          /* ABOUT TEASER */
          .teaser__inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
          @media (max-width: 768px) { .teaser__inner { grid-template-columns: 1fr; gap: 2rem; } }
          .teaser__body { color: #6b7280; line-height: 1.75; margin: 1rem 0 1.75rem; }
          .teaser__stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
          .stat { background: #f8fafc; border-radius: 12px; padding: 1.5rem; text-align: center; }
          .stat__number { display: block; font-size: clamp(1.75rem,4vw,2.5rem); font-weight: 800; color: #1a5c8a; }
          .stat__label { font-size: 0.8rem; color: #6b7280; font-weight: 500; margin-top: 0.25rem; display: block; }
          .stat--edit { position: relative; outline: 2px dashed rgba(32,178,170,0.5); outline-offset: 2px; border-radius: 12px; }

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

          /* CMS TOOLBAR */
          .cms-tb-btn { transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease; }
          .cms-tb-btn--primary:hover { background: #4338ca; border-color: #4338ca; }
          .cms-tb-btn--outline:hover { background: #f9fafb; border-color: #d1d5db; }
          .cms-tb-btn--ghost:hover { background: #f3f4f6; color: #374151; }
          .cms-tb-btn:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }
          .cms-tb-btn:disabled { opacity: 0.65; cursor: not-allowed; }
          @media (max-width: 640px) {
            .cms-toolbar__status { display: none; }
          }
        `}</style>
      </Head>

      {/* ─── CMS TOOLBAR ─────────────────────────────────────────────────── */}
      {canEdit && (
        <div ref={toolbarRef} className="cms-toolbar" style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', rowGap: '8px', columnGap: '16px',
          padding: '10px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', minWidth: 0 }}>
            <span style={{ color: '#4f46e5', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.3px' }}>Canvō</span>
            <span style={{
              background: editMode ? '#4f46e5' : '#eef2ff', color: editMode ? '#fff' : '#4338ca',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: '999px', whiteSpace: 'nowrap',
            }}>
              {editMode ? 'CMS Editing' : 'CMS Preview'}
            </span>
            <span className="cms-toolbar__status" style={{ color: '#6b7280', fontSize: '12.5px' }}>
              {editMode
                ? 'Click outlined text or image buttons to edit.'
                : 'Previewing ' + tenant.name}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {saveMsg && (
              <span style={{ color: '#16a34a', fontSize: '12.5px', fontWeight: 600 }}>
                &#10003; {saveMsg}
              </span>
            )}
            <a href="/client" className="cms-tb-btn cms-tb-btn--outline" style={tbBtn('outline')} title="Advanced settings, SEO & bulk editing">
              Settings
            </a>
            {editMode ? (
              <>
                <button onClick={handleDiscard} className="cms-tb-btn cms-tb-btn--ghost" style={tbBtn('ghost')}>Discard</button>
                <button onClick={handleSaveAndExit} disabled={saving}
                  className="cms-tb-btn cms-tb-btn--primary" style={tbBtn('primary')}>
                  {saving ? 'Saving...' : 'Save & Exit'}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditMode(true)} className="cms-tb-btn cms-tb-btn--primary" style={tbBtn('primary')}>Edit Site</button>
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="cms-tb-btn cms-tb-btn--ghost" style={tbBtn('ghost')}>Sign Out</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── PAGE CANVAS ─────────────────────────────────────────────────── */}
      <div style={{ paddingTop: canEdit ? `${toolbarHeight}px` : '0' }}>

        {/* NAV */}
        <header className="apex-nav" style={{ top: canEdit ? `${toolbarHeight}px` : 0 }}>
          <a className="apex-nav__logo" href="#">
            <EditImage value={c.logoUrl} onChange={v => set('logoUrl', v)} label="Logo Image" editMode={editMode} variant="corner">
              <div className="apex-nav__logo-tile">
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '7px' }} />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
                    <rect width="36" height="36" rx="7" fill="#1e7a8c"/>
                  </svg>
                )}
              </div>
            </EditImage>
            <div className="apex-nav__wordmark">
              {editMode ? (
                <span className="apex-nav__apex">
                  <EditSpan value={c.businessName} onChange={v => set('businessName', v)}
                    style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.1em', color: '#0d3b5e' }} />
                </span>
              ) : (
                <span className="apex-nav__apex">{c.businessName || tenant.name}</span>
              )}
              {editMode ? (
                <span className="apex-nav__sub">
                  <EditSpan value={c.navSubtitle} onChange={v => set('navSubtitle', v)}
                    style={{ fontSize: '0.65rem', fontWeight: 500, color: '#4b7fa3', letterSpacing: '0.04em' }} />
                </span>
              ) : (
                navSubtitle ? <span className="apex-nav__sub">{navSubtitle}</span> : null
              )}
            </div>
          </a>
          <ul className={`apex-nav__links${navOpen ? ' is-open' : ''}`}>
            <li><a href="#services" onClick={() => setNavOpen(false)}>Services</a></li>
            <li><a href="#about" onClick={() => setNavOpen(false)}>About</a></li>
            <li><a href="#contact" onClick={() => setNavOpen(false)}>Contact</a></li>
            <li><a className="btn-nav" href="#contact" onClick={() => setNavOpen(false)}>Book Appointment</a></li>
          </ul>
          <button
            className="apex-nav__toggle"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen(o => !o)}
          >
            <span className="apex-nav__toggle-bar" />
            <span className="apex-nav__toggle-bar" />
            <span className="apex-nav__toggle-bar" />
          </button>
        </header>

        {/* HERO */}
        <EditImage value={c.heroImageUrl} onChange={v => set('heroImageUrl', v)} label="Hero Background" editMode={editMode} variant="section">
          <section className="apex-hero" style={heroStyle}>
            <div className="apex-hero__bg" />
            <div className="apex-hero__content">
              <p className="apex-hero__eyebrow">
                {editMode ? (
                  <EditSpan value={c.eyebrow} onChange={v => set('eyebrow', v)} darkBg />
                ) : (
                  c.eyebrow || ''
                )}
              </p>
              {editMode ? (
                <div className="apex-hero__heading">
                  <EditSpan value={c.heroHeadline} onChange={v => set('heroHeadline', v)} darkBg style={{ display: 'block' }} />
                </div>
              ) : (
                c.heroHeadline ? (
                  <h1 className="apex-hero__heading"
                    dangerouslySetInnerHTML={{ __html: escapeAllowingBr(c.heroHeadline) }} />
                ) : (
                  <h1 className="apex-hero__heading" style={{ opacity: 0.4, fontStyle: 'italic' }}>Your headline here</h1>
                )
              )}
              {editMode ? (
                <p className="apex-hero__sub">
                  <EditSpan value={c.heroSubheadline} onChange={v => set('heroSubheadline', v)} multiline darkBg />
                </p>
              ) : (
                c.heroSubheadline ? (
                  <p className="apex-hero__sub">{c.heroSubheadline}</p>
                ) : null
              )}
              <div className="apex-hero__actions">
                {editMode ? (
                  <div>
                    <EditSpan value={c.heroCtaText} onChange={v => set('heroCtaText', v)} darkBg
                      style={{ background: '#20b2aa', color: '#fff', borderRadius: '50px',
                        padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 600, display: 'inline-block' }} />
                    <div className="cta-url-row">
                      <span className="cta-url-label">Link:</span>
                      <EditSpan value={c.heroCtaUrl} onChange={v => set('heroCtaUrl', v)} darkBg
                        style={{ fontSize: '11px', color: '#7ee8e4' }} />
                    </div>
                  </div>
                ) : (
                  (c.heroCtaText || c.heroCtaUrl) ? (
                    <a className="btn-primary" href={c.heroCtaUrl || '#contact'}>
                      {c.heroCtaText || 'Learn More'}
                    </a>
                  ) : null
                )}
                <a className="btn-ghost" href="#services">Our Services</a>
              </div>
            </div>
          </section>
        </EditImage>

        {/* TRUST BAR */}
        <section className="trust-bar" aria-hidden="true">
          <ul className="trust-bar__list">
            {['Accepting New Patients','Most Insurance Accepted','Same-Week Appointments','Expert Specialists',
              'Accepting New Patients','Most Insurance Accepted','Same-Week Appointments','Expert Specialists'].map((t,i) => (
              <li key={i} className="trust-bar__item">&#10086; {t}</li>
            ))}
          </ul>
        </section>

        {/* SERVICES */}
        <section className="section" id="services" style={{ background: '#fff' }}>
          <div className="container">
            <div className="section__header">
              <p className="section__eyebrow">What We Offer</p>
              <h2 className="section__heading">{c.businessName || tenant.name}</h2>
            </div>
            {services.length > 0 ? (
              <ul className="services__grid">
                {services.map((svc, i) => {
                  const accent = SERVICE_ACCENTS[i % SERVICE_ACCENTS.length]
                  return (
                    <li key={i} className="service-card" style={{ '--card-bg': accent.bg, '--card-border': accent.border }}>
                      <div className="service-card__icon" dangerouslySetInnerHTML={{ __html: accent.icon }} />
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
            ) : (
              editMode ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>No services added yet. Use Settings to add services.</p>
              ) : null
            )}
            <div className="services__cta">
              <a className="btn-primary" href="#contact">Get in Touch</a>
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        {/* ABOUT */}
        <section className="section" id="about" style={{ background: '#f8fafc' }}>
          <div className="container">
            <div className="teaser__inner">
              <div>
                <p className="section__eyebrow">About Us</p>
                <h2 className="section__heading">{c.businessName || tenant.name}</h2>
                {editMode ? (
                  <div className="teaser__body">
                    <EditSpan value={c.aboutText} onChange={v => set('aboutText', v)} multiline />
                  </div>
                ) : (
                  c.aboutText ? (
                    <p className="teaser__body">{c.aboutText}</p>
                  ) : null
                )}
                <a className="btn-primary" href="#contact">Learn About Us</a>
              </div>
              <div className="teaser__stats">
                {[0,1,2,3].map(i => {
                  const numKey = `stat${i+1}Number`
                  const lblKey = `stat${i+1}Label`
                  const hasData = (c[numKey] && c[numKey].trim()) || (c[lblKey] && c[lblKey].trim())
                  if (!editMode && !hasData) return null
                  return (
                    <div key={i} className={`stat${editMode ? ' stat--edit' : ''}`}>
                      {editMode ? (
                        <>
                          <span className="stat__number">
                            <EditSpan value={c[numKey]} onChange={v => set(numKey, v)}
                              style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: '#1a5c8a' }} />
                          </span>
                          <span className="stat__label">
                            <EditSpan value={c[lblKey]} onChange={v => set(lblKey, v)}
                              style={{ fontSize: '0.8rem', color: '#6b7280' }} />
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="stat__number">{c[numKey]}</span>
                          <span className="stat__label">{c[lblKey]}</span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* TEAM */}
        {(editMode || teamMembers.length > 0) && (
          <>
            <hr className="section-divider" />
            <section className="section" id="team" style={{ background: '#fff' }}>
              <div className="container">
                <div className="section__header">
                  <p className="section__eyebrow">Meet the Team</p>
                  <h2 className="section__heading">Our Specialists</h2>
                </div>
                {teamMembers.length > 0 ? (
                  <ul className="team__grid">
                    {teamMembers.map((m, i) => (
                      <li key={i} className="team-card">
                        <EditImage value={m.imageUrl} onChange={v => setTeamMember(i, 'imageUrl', v)} label="Photo" editMode={editMode} variant="corner">
                          <div className="team-card__photo">
                            {m.imageUrl
                              ? <img src={m.imageUrl} alt={m.name || 'Team member'} />
                              : <span>{(m.name || '?').charAt(0).toUpperCase()}</span>}
                          </div>
                        </EditImage>
                        {editMode ? (
                          <>
                            <div className="team-card__name"><EditSpan value={m.name} onChange={v => setTeamMember(i, 'name', v)} /></div>
                            <div className="team-card__title"><EditSpan value={m.title} onChange={v => setTeamMember(i, 'title', v)} /></div>
                            <div className="team-card__bio"><EditSpan value={m.bio} onChange={v => setTeamMember(i, 'bio', v)} multiline /></div>
                          </>
                        ) : (
                          <>
                            <h3 className="team-card__name">{m.name}</h3>
                            {m.title && <p className="team-card__title">{m.title}</p>}
                            {m.bio && <p className="team-card__bio">{m.bio}</p>}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>No team members added yet. Use Settings to add team members.</p>
                )}
              </div>
            </section>
          </>
        )}

        {/* TESTIMONIALS */}
        {(editMode || testimonials.length > 0) && (
          <>
            <hr className="section-divider" />
            <section className="section" id="testimonials" style={{ background: '#f8fafc' }}>
              <div className="container">
                <div className="section__header">
                  <p className="section__eyebrow">Testimonials</p>
                  <h2 className="section__heading">What Patients Say</h2>
                </div>
                {testimonials.length > 0 ? (
                  <ul className="testimonials__grid">
                    {testimonials.map((t, i) => (
                      <li key={i} className="testimonial-card">
                        {editMode ? (
                          <>
                            <div className="testimonial-card__quote"><EditSpan value={t.quote} onChange={v => setTestimonial(i, 'quote', v)} multiline /></div>
                            <div className="testimonial-card__author"><EditSpan value={t.author} onChange={v => setTestimonial(i, 'author', v)} /></div>
                            <div className="testimonial-card__role"><EditSpan value={t.role} onChange={v => setTestimonial(i, 'role', v)} /></div>
                          </>
                        ) : (
                          <>
                            {t.quote && <p className="testimonial-card__quote">&ldquo;{t.quote}&rdquo;</p>}
                            <p className="testimonial-card__author">{t.author}</p>
                            {t.role && <p className="testimonial-card__role">{t.role}</p>}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>No testimonials added yet. Use Settings to add testimonials.</p>
                )}
              </div>
            </section>
          </>
        )}

        <hr className="section-divider" />

        {/* CONTACT */}
        <section className="section" id="contact" style={{ background: '#fff' }}>
          <div className="container">
            <div className="section__header">
              <p className="section__eyebrow">Get in Touch</p>
              <h2 className="section__heading">Book Your Appointment</h2>
            </div>
            <div className="contact__grid">
              <div>
                <h3 className="contact-info__title">Contact Information</h3>
                <ul className="contact-info__list">
                  {(editMode || c.contactAddress) && (
                    <li>
                      <span className="contact-info__label">Address</span>
                      {editMode ? (
                        <EditSpan value={c.contactAddress} onChange={v => set('contactAddress', v)} multiline />
                      ) : (
                        <p dangerouslySetInnerHTML={{ __html: escapeAllowingBr(c.contactAddress).replace(/\n/g,'<br>') }} />
                      )}
                    </li>
                  )}
                  {(editMode || c.contactPhone) && (
                    <li>
                      <span className="contact-info__label">Phone</span>
                      {editMode ? (
                        <EditSpan value={c.contactPhone} onChange={v => set('contactPhone', v)} />
                      ) : (
                        <p><a href={`tel:${c.contactPhone.replace(/\D/g,'')}`}>{c.contactPhone}</a></p>
                      )}
                    </li>
                  )}
                  {(editMode || c.contactEmail) && (
                    <li>
                      <span className="contact-info__label">Email</span>
                      {editMode ? (
                        <EditSpan value={c.contactEmail} onChange={v => set('contactEmail', v)} />
                      ) : (
                        <p><a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a></p>
                      )}
                    </li>
                  )}
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
                  <select disabled><option>Select a service…</option></select>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea placeholder="How can we help?" disabled />
                </div>
                <button className="form-submit" disabled>Send Request</button>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem', textAlign: 'center' }}>
                  Contact form — coming soon.
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
                <p className="footer__brand-name">{c.businessName || tenant.name}</p>
                {c.aboutText ? <p className="footer__tagline">{c.aboutText.slice(0, 120)}{c.aboutText.length > 120 ? '…' : ''}</p> : null}
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
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>
              <div>
                <p className="footer__col-heading">Contact</p>
                <ul className="footer__links">
                  {c.contactPhone && <li><a href={`tel:${c.contactPhone.replace(/\D/g,'')}`}>{c.contactPhone}</a></li>}
                  {c.contactEmail && <li><a href={`mailto:${c.contactEmail}`}>{c.contactEmail}</a></li>}
                </ul>
              </div>
            </div>
            <div className="footer__bottom">
              <p>&#169; 2026 {c.businessName || tenant.name}. All rights reserved.</p>
              <nav className="footer__legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Use</a>
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

    // Double-lock: match on BOTH tenantId AND siteSlug to prevent cross-tenant bleed
    const raw = await SiteContent.findOne({ tenantId: tenant._id, siteSlug: slug }).lean()

    const c = raw ? {
      businessName:    raw.businessName    || '',
      navSubtitle:     raw.navSubtitle     || '',
      eyebrow:         raw.eyebrow         || '',
      heroHeadline:    raw.heroHeadline    || '',
      heroSubheadline: raw.heroSubheadline || '',
      heroCtaText:     raw.heroCtaText     || '',
      heroCtaUrl:      raw.heroCtaUrl      || '',
      aboutText:       raw.aboutText       || '',
      stat1Number: raw.stat1Number || '',
      stat1Label:  raw.stat1Label  || '',
      stat2Number: raw.stat2Number || '',
      stat2Label:  raw.stat2Label  || '',
      stat3Number: raw.stat3Number || '',
      stat3Label:  raw.stat3Label  || '',
      stat4Number: raw.stat4Number || '',
      stat4Label:  raw.stat4Label  || '',
      services:       (raw.services || []).map(s => ({ title: s.title || '', description: s.description || '' })),
      teamMembers:    (raw.teamMembers  || []).map(m => ({ name: m.name || '', title: m.title || '', bio: m.bio || '', imageUrl: m.imageUrl || '' })),
      testimonials:   (raw.testimonials || []).map(t => ({ quote: t.quote || '', author: t.author || '', role: t.role || '' })),
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
