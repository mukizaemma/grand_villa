'use client'

import React, { useState } from 'react'
import { useConfig } from '@payloadcms/ui'

function publicHref(collectionSlug, row) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const slug = row?.slug
  if (collectionSlug === 'rooms' && slug) return `${origin}/accommodation/${slug}`
  if (collectionSlug === 'experiences') return `${origin}/things-to-do`
  if (collectionSlug === 'menu-items') return `${origin}/bar-restaurant`
  if (collectionSlug === 'amenities') return `${origin}/`
  if (collectionSlug === 'media') return row?.url || row?.thumbnailURL || ''
  if (collectionSlug === 'gallery-photos') return `${origin}/gallery`
  return ''
}

function Icon({ children }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const btn = {
  width: 30,
  height: 30,
  border: 0,
  borderRadius: 8,
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  color: '#fff',
}

export function RowActionsCell({ rowData, collectionSlug }) {
  const { config } = useConfig()
  const [busy, setBusy] = useState(false)
  const id = rowData?.id
  if (!id || !collectionSlug) return null

  const adminRoute = config?.routes?.admin || '/admin'
  const apiRoute = config?.routes?.api || '/api'
  const editHref = `${adminRoute}/collections/${collectionSlug}/${id}`
  const viewHref = publicHref(collectionSlug, rowData) || editHref

  async function remove(event) {
    event.preventDefault()
    event.stopPropagation()
    const label = rowData.name || rowData.guestName || rowData.filename || rowData.label || 'this record'
    if (!window.confirm(`Delete ${label}?`)) return
    setBusy(true)
    try {
      const response = await fetch(`${apiRoute}/${collectionSlug}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        window.alert('Could not delete this record.')
        setBusy(false)
        return
      }
      window.location.reload()
    } catch {
      window.alert('Could not delete this record.')
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={(event) => event.stopPropagation()}>
      <a href={viewHref} target={viewHref === editHref ? undefined : '_blank'} rel="noreferrer" aria-label="View" title="View" style={{ ...btn, background: '#c88b4a' }}>
        <Icon>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </Icon>
      </a>
      <a href={editHref} aria-label="Edit" title="Edit" style={{ ...btn, background: '#1a2b4b' }}>
        <Icon>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </Icon>
      </a>
      <button type="button" aria-label="Delete" title="Delete" disabled={busy} onClick={remove} style={{ ...btn, background: '#b42318', opacity: busy ? 0.6 : 1 }}>
        <Icon>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </Icon>
      </button>
    </div>
  )
}
