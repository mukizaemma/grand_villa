'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Gutter } from '@payloadcms/ui'
import './siteGalleryList.css'

function imageSrc(doc) {
  return doc?.thumbnailURL || doc?.sizes?.thumbnail?.url || doc?.url || ''
}

function fileKey(doc) {
  return String(doc?.filename || doc?.alt || '').trim().toLowerCase()
}

export function SiteGalleryList() {
  const [docs, setDocs] = useState([])
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  async function load() {
    const params = new URLSearchParams({
      limit: '300',
      depth: '0',
      sort: 'galleryOrder,-createdAt',
      'where[mimeType][contains]': 'image',
    })
    const res = await fetch(`/api/media?${params}`, { credentials: 'include' })
    if (!res.ok) throw new Error('load failed')
    const json = await res.json()
    setDocs(json.docs || [])
  }

  useEffect(() => {
    load().catch(() => setNote('Could not load the images on the server.'))
  }, [])

  const visible = docs.filter((doc) => !doc.hiddenFromGallery)
  const hidden = docs.filter((doc) => doc.hiddenFromGallery)
  const duplicateNames = useMemo(() => {
    const counts = {}
    for (const doc of visible) {
      const key = fileKey(doc)
      if (!key) continue
      counts[key] = (counts[key] || 0) + 1
    }
    return new Set(Object.entries(counts).filter(([, count]) => count > 1).map(([key]) => key))
  }, [visible])

  async function saveOrder(nextVisible) {
    setDocs([...nextVisible, ...docs.filter((doc) => doc.hiddenFromGallery)])
    setBusy(true)
    setNote('')
    try {
      await Promise.all(
        nextVisible.map((doc, index) =>
          fetch(`/api/media/${doc.id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ galleryOrder: index + 1, hiddenFromGallery: false }),
          }),
        ),
      )
      setNote('Order saved. The public gallery uses this sequence.')
    } catch {
      setNote('Could not save the order.')
      load().catch(() => {})
    } finally {
      setBusy(false)
    }
  }

  function move(index, direction) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= visible.length) return
    const copy = [...visible]
    const [item] = copy.splice(index, 1)
    copy.splice(nextIndex, 0, item)
    saveOrder(copy)
  }

  async function removeFromGallery(doc) {
    setBusy(true)
    setNote('')
    try {
      const updated = await fetch(`/api/media/${doc.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hiddenFromGallery: true, showOnGallery: false }),
      })
      if (!updated.ok) throw new Error('remove failed')
      const listed = await fetch(`/api/gallery-photos?limit=100&depth=0&where[photo][equals]=${doc.id}`, {
        credentials: 'include',
      })
      if (listed.ok) {
        const rows = (await listed.json()).docs || []
        await Promise.all(
          rows.map((row) =>
            fetch(`/api/gallery-photos/${row.id}`, { method: 'DELETE', credentials: 'include' }),
          ),
        )
      }
      setDocs((current) =>
        current.map((item) => (item.id === doc.id ? { ...item, hiddenFromGallery: true, showOnGallery: false } : item)),
      )
      setNote('Removed from the public gallery. The file is still in the media library.')
    } catch {
      setNote('Could not remove this photo.')
    } finally {
      setBusy(false)
    }
  }

  async function restore(doc) {
    setBusy(true)
    setNote('')
    try {
      const updated = await fetch(`/api/media/${doc.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hiddenFromGallery: false }),
      })
      if (!updated.ok) throw new Error('restore failed')
      setDocs((current) =>
        current.map((item) => (item.id === doc.id ? { ...item, hiddenFromGallery: false } : item)),
      )
      setNote('Restored to the public gallery.')
    } catch {
      setNote('Could not restore this photo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Gutter className="site-gallery">
      <header className="site-gallery__header">
        <h1>Site Gallery</h1>
        <p>Every image on the server. Move them into the order guests should see, and remove duplicates or photos that do not belong on the gallery page.</p>
        {note ? <p className="site-gallery__note">{note}</p> : null}
      </header>

      <div className="site-gallery__grid">
        {visible.map((doc, index) => {
          const duplicate = duplicateNames.has(fileKey(doc))
          return (
            <article key={doc.id} className={duplicate ? 'is-duplicate' : undefined}>
              {imageSrc(doc) ? <img src={imageSrc(doc)} alt={doc.alt || doc.filename || ''} /> : <div className="site-gallery__empty">No preview</div>}
              <div className="site-gallery__meta">
                <strong>{doc.alt || doc.filename}</strong>
                {duplicate ? <span>Duplicate file name</span> : <span>On the gallery</span>}
                <div className="site-gallery__actions">
                  <button type="button" disabled={busy || index === 0} onClick={() => move(index, -1)}>
                    Earlier
                  </button>
                  <button type="button" disabled={busy || index === visible.length - 1} onClick={() => move(index, 1)}>
                    Later
                  </button>
                  <button type="button" className="is-remove" disabled={busy} onClick={() => removeFromGallery(doc)}>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {visible.length === 0 && <p>No images are on the gallery yet.</p>}

      {hidden.length > 0 && (
        <section className="site-gallery__removed">
          <h2>Removed from the gallery</h2>
          <div className="site-gallery__grid">
            {hidden.map((doc) => (
              <article key={doc.id} className="is-hidden">
                {imageSrc(doc) ? <img src={imageSrc(doc)} alt="" /> : <div className="site-gallery__empty">No preview</div>}
                <div className="site-gallery__meta">
                  <strong>{doc.alt || doc.filename}</strong>
                  <span>Hidden from the public page</span>
                  <div className="site-gallery__actions">
                    <button type="button" disabled={busy} onClick={() => restore(doc)}>
                      Put back
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </Gutter>
  )
}
