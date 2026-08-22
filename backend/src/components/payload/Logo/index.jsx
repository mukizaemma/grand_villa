import React from 'react'

export function Logo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 0 1rem',
      }}
    >
      <img
        src="/images/gmasters-logo.png"
        alt="Grand Villa Apartment"
        width="72"
        height="72"
        style={{
          width: 72,
          height: 72,
          objectFit: 'contain',
          borderRadius: '50%',
          background: '#fff',
          border: '1px solid #c4a574',
          padding: 6,
        }}
      />
      <span
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '1.45rem',
          fontStyle: 'italic',
          color: '#1a2b4b',
          letterSpacing: '0.01em',
        }}
      >
        Grand Villa
      </span>
    </div>
  )
}
