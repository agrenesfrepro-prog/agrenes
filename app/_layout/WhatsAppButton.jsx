'use client'

import React from 'react'

export default function WhatsAppButton() {
  return React.createElement('a', {
    href: 'https://wa.me/447950554456',
    target: '_blank',
    rel: 'noopener noreferrer',
    title: 'Chat with AGRENES on WhatsApp',
    style: {
      position: 'fixed',
      bottom: 80,
      right: 16,
      zIndex: 600,
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: '#25D366',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(37,211,102,.45)',
      textDecoration: 'none',
      fontSize: 28
    }
  }, '??')
}
