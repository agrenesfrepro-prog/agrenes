'use client'

import React, { useState, useEffect, useRef } from 'react'

// Two real numbers — pick which team the customer talks to
const CONTACTS = [
  {
    flag: '🇺🇬',
    label: 'Uganda ops team',
    number: '256706956784',
    display: '+256 706 956 784',
    message: 'Hello AGRENES! I would like to ask about your products.',
  },
  {
    flag: '🇬🇧',
    label: 'UK support',
    number: '447950554456',
    display: '+44 7950 554456',
    message: 'Hello AGRENES Market! I have a question about my order or delivery.',
  },
]

// Official WhatsApp glyph, rendered as inline SVG (never breaks under Windows encoding)
function WhatsAppGlyph({ size = 32, color = '#fff' }) {
  return React.createElement(
    'svg',
    { viewBox: '0 0 32 32', width: size, height: size, fill: color, 'aria-hidden': 'true' },
    React.createElement('path', {
      d: 'M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.59-1.68a12.74 12.74 0 0 0 6.21 1.61h.01c7.06 0 12.79-5.74 12.79-12.8 0-3.42-1.33-6.63-3.75-9.05a12.72 12.72 0 0 0-9.05-3.68zm0 23.37h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.03 1.07-3.92-.25-.4a10.55 10.55 0 0 1-1.63-5.66c0-5.87 4.78-10.65 10.66-10.65 2.85 0 5.52 1.11 7.53 3.12a10.59 10.59 0 0 1 3.12 7.54c0 5.87-4.78 10.65-10.68 10.65zm5.84-7.97c-.32-.16-1.89-.93-2.19-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.08 1.3 3.29.16.21 2.25 3.44 5.45 4.82.76.33 1.36.53 1.82.68.77.24 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37z',
    })
  )
}

// Close X icon
function CloseIcon() {
  return React.createElement(
    'svg',
    { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: '#666', strokeWidth: 2, strokeLinecap: 'round' },
    React.createElement('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
    React.createElement('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
  )
}

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  // Close on outside click / touch
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return React.createElement('div', {
    ref: wrapperRef,
    style: {
      position: 'fixed',
      bottom: 80,
      right: 16,
      zIndex: 600,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 12,
    },
  },
    // ── Expandable menu ────────────────────────────────────────────────
    open && React.createElement('div', {
      style: {
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 10px 40px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.06)',
        width: 260,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,.08)',
        animation: 'agrenesWaSlide .18s ease-out',
      }
    },
      // Header row: 💬 Chat with us + X close
      React.createElement('div', {
        style: {
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #eee',
        }
      },
        React.createElement('div', { style: { fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement('span', { style: { fontSize: 18 } }, '💬'),
          'Chat with us'
        ),
        React.createElement('button', {
          onClick: () => setOpen(false),
          'aria-label': 'Close chat menu',
          style: {
            background: 'none',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }
        }, React.createElement(CloseIcon))
      ),
      // Contact rows separated by dividers
      ...CONTACTS.map((c, i) => React.createElement('a', {
        key: c.number,
        href: `https://wa.me/${c.number}?text=${encodeURIComponent(c.message)}`,
        target: '_blank',
        rel: 'noopener noreferrer',
        onClick: () => setOpen(false),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          textDecoration: 'none',
          color: '#1a1a18',
          transition: 'background .15s',
          borderBottom: i < CONTACTS.length - 1 ? '1px solid #eee' : 'none',
        },
        onMouseEnter: (e) => { e.currentTarget.style.background = '#f4f9f7' },
        onMouseLeave: (e) => { e.currentTarget.style.background = 'transparent' },
      },
        React.createElement('div', { style: { fontSize: 22, lineHeight: 1, flexShrink: 0 } }, c.flag),
        React.createElement('div', { style: { flex: 1, minWidth: 0 } },
          React.createElement('div', { style: { fontSize: 13.5, fontWeight: 700, marginBottom: 3 } }, c.label),
          React.createElement('div', { style: { fontSize: 12, color: '#666' } }, c.display)
        ),
        React.createElement('div', { style: { flexShrink: 0 } },
          React.createElement(WhatsAppGlyph, { size: 20, color: '#25D366' })
        )
      ))
    ),
    // ── Floating trigger button ────────────────────────────────────────
    React.createElement('button', {
      onClick: () => setOpen(!open),
      'aria-label': open ? 'Close chat menu' : 'Open chat menu',
      'aria-expanded': open,
      title: 'Chat with AGRENES on WhatsApp',
      style: {
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#25D366',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(37,211,102,.45)',
        transition: 'transform .2s',
        padding: 0,
        transform: open ? 'rotate(90deg)' : 'rotate(0)',
      },
      onMouseEnter: (e) => { e.currentTarget.style.transform = open ? 'rotate(90deg) scale(1.08)' : 'scale(1.08)' },
      onMouseLeave: (e) => { e.currentTarget.style.transform = open ? 'rotate(90deg)' : 'scale(1)' },
    }, React.createElement(WhatsAppGlyph, { size: 32, color: '#fff' })),
    // Inline keyframes for slide animation
    React.createElement('style', null,
      `@keyframes agrenesWaSlide {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }`
    )
  )
}
