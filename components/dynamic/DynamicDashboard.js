import { useState } from 'react'
import Head from 'next/head'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import ImageUploadButton from '../ImageUploadButton'
import Icon from '../Icon'
import { theme } from '../../lib/theme'

/**
 * DynamicDashboard.js
 *
 * Schema-driven counterpart to pages/client/index.js's hardcoded form.
 * Rendered instead of the fixed dashboard when a tenant has a
 * SiteSchema document. Everything here is generic: a `schema` (array
 * of sections, each with a `fields` tree) plus an `initialData` object
 * drive the entire form — no field name is known ahead of time.
 *
 * A little style duplication from pages/client/index.js is deliberate:
 * that file's internals aren't exported, and this keeps the already
 *-verified fixed dashboard completely untouched.
 */

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
const itemBox = { background: theme.color.surfaceMuted, border: `1px solid ${theme.color.divider}`, borderRadius: theme.radius.md, padding: '1rem 1.1rem', marginBottom: '0.75rem' }
const addBtn = {
  padding: '9px 16px', background: 'transparent', border: `1.5px dashed ${theme.color.borderStrong}`,
  borderRadius: theme.radius.sm, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: theme.color.accent,
}
const removeBtn = { padding: '5px 10px', background: theme.color.dangerSoft, border: `1px solid ${theme.color.dangerBorder}`, borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: theme.color.danger, fontWeight: 600 }

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {label && <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem', color: theme.color.inkSoft }}>{label}</label>}
      {hint && <span style={{ display: 'block', fontSize: '0.76rem', color: theme.color.inkFaint, marginBottom: '0.4rem' }}>{hint}</span>}
      {children}
    </div>
  )
}

function SectionCard({ id, icon, tone = 'accent', title, subtitle, children }) {
  const tileBg = tone === 'live' ? theme.color.liveSoft : theme.color.accentSoft
  const tileFg = tone === 'live' ? theme.color.live : theme.color.accent
  return (
    <div id={id} style={{
      background: theme.color.surface, borderRadius: theme.radius.lg,
      boxShadow: theme.shadow.card, padding: '1.75rem', marginBottom: '1.25rem',
      scrollMarginTop: '132px',
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

// Immutable get/set along a path of string keys and/or array indices.
function getAtPath(obj, path) {
  return path.reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}
function setAtPath(obj, path, value) {
  if (path.length === 0) return value
  const [head, ...rest] = path
  const container = typeof head === 'number' ? [...(obj || [])] : { ...(obj || {}) }
  container[head] = setAtPath(container[head], rest, value)
  return container
}

// Blank value for a freshly-added list item, built by walking the
// item's own field definitions (recursing into nested lists).
function buildDefaultItem(fieldDefs) {
  const obj = {}
  for (const f of fieldDefs || []) {
    obj[f.key] = f.type === 'list' ? [] : ''
  }
  return obj
}

export default function DynamicDashboard({ schema, initialData, siteSlug, clientEmail, clientName, viewerRole }) {
  const router = useRouter()
  const [data, setData] = useState(initialData || {})
  const [saveState, setSaveState] = useState('idle')

  const setPath = (path, value) => setData(d => setAtPath(d, path, value))

  const addItem = (path, fieldDef) => {
    const current = getAtPath(data, path) || []
    if (typeof fieldDef.max === 'number' && current.length >= fieldDef.max) return
    setPath(path, [...current, buildDefaultItem(fieldDef.fields)])
  }
  const removeItem = (path, index) => {
    const current = [...(getAtPath(data, path) || [])]
    current.splice(index, 1)
    setPath(path, current)
  }

  const handleSaveAll = async () => {
    setSaveState('saving')
    try {
      const res = await fetch(`/api/site-data/${siteSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  function renderField(fieldDef, path) {
    const value = getAtPath(data, path)

    if (fieldDef.type === 'textarea') {
      return (
        <Field label={fieldDef.label} hint={fieldDef.hint}>
          <textarea style={ta} rows={3} value={value || ''} onChange={e => setPath(path, e.target.value)} />
        </Field>
      )
    }

    if (fieldDef.type === 'image') {
      return (
        <Field label={fieldDef.label} hint={fieldDef.hint}>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <input style={{ ...inp, flex: 1 }} value={value || ''} onChange={e => setPath(path, e.target.value)} placeholder="https://..." />
            <ImageUploadButton label="Upload" onUploaded={url => setPath(path, url)} style={uploadBtn} />
          </div>
        </Field>
      )
    }

    if (fieldDef.type === 'list') {
      const items = value || []
      const itemLabel = fieldDef.itemLabel || 'Item'
      return (
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: theme.color.inkSoft, marginBottom: '0.2rem' }}>
            {fieldDef.label} {typeof fieldDef.max === 'number' && <span style={{ fontWeight: 400, color: theme.color.inkFaint }}>(up to {fieldDef.max})</span>}
          </label>
          {fieldDef.hint && <span style={{ display: 'block', fontSize: '0.76rem', color: theme.color.inkFaint, marginBottom: '0.75rem' }}>{fieldDef.hint}</span>}
          {items.map((item, i) => (
            <div key={i} style={itemBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '0.85rem', color: theme.color.inkSoft }}>{itemLabel} {i + 1}</strong>
                <button style={removeBtn} onClick={() => removeItem(path, i)}>✕ Remove</button>
              </div>
              {(fieldDef.fields || []).map(sub => (
                <div key={sub.key}>{renderField(sub, [...path, i, sub.key])}</div>
              ))}
            </div>
          ))}
          {(typeof fieldDef.max !== 'number' || items.length < fieldDef.max) && (
            <button style={addBtn} onClick={() => addItem(path, fieldDef)}>+ Add {itemLabel}</button>
          )}
        </div>
      )
    }

    // 'text' / 'url' / default
    return (
      <Field label={fieldDef.label} hint={fieldDef.hint}>
        <input style={inp} value={value || ''} onChange={e => setPath(path, e.target.value)} />
      </Field>
    )
  }

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

      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: theme.color.bg,
        backgroundImage: `radial-gradient(1100px 560px at 88% -8%, rgba(79,70,229,0.07), transparent 60%), radial-gradient(900px 480px at -8% 105%, rgba(32,178,170,0.06), transparent 55%)`,
      }} />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', fontFamily: theme.font }}>

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

        <div style={{
          position: 'sticky', top: '60px', zIndex: 40,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)',
          borderBottom: `1px solid ${theme.color.divider}`,
        }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0.6rem 2rem', display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
            {schema.map(s => (
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

          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 800, color: theme.color.ink, letterSpacing: '-0.02em' }}>Welcome, {clientName || clientEmail}</h1>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: theme.color.inkFaint }}>Edit your site content below. Changes go live as soon as you save.</p>
          </div>

          {schema.map(section => (
            <SectionCard key={section.id} id={section.id} icon={section.icon} tone={section.tone} title={section.label}>
              {(section.fields || []).map(f => (
                <div key={f.key}>{renderField(f, [f.key])}</div>
              ))}
            </SectionCard>
          ))}

        </main>

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
