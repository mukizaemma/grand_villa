'use client'

import React, { useState } from 'react'
import { useListDrawer } from '@payloadcms/ui'
import { formatBytes, prepareUploadFiles, uploadPreparedFile } from '../prepareImage.js'
import '../MediaGridField/mediaGridField.css'

function mediaId(value) {
  if (!value) return ''
  if (typeof value === 'object') return String(value.id || value._id || '')
  return String(value)
}

async function publishPhoto(id, caption) {
  const saved = await fetch('/api/gallery-photos', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      photo: id,
      caption: caption || 'Gallery photo',
      category: 'rooms',
      aspect: 'square',
    }),
  })
  if (!saved.ok) throw new Error('Could not add this photo')
}

export function SiteGalleryAdd() {
  const [queue, setQueue] = useState([])
  const [busy, setBusy] = useState(false)
  const [ListDrawer, , { openDrawer, closeDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    uploads: true,
  })

  async function addIds(ids, captions = {}) {
    const unique = [...new Set(ids.map(mediaId).filter(Boolean))]
    if (!unique.length) return
    setBusy(true)
    try {
      for (const id of unique) {
        await publishPhoto(id, captions[id])
      }
      window.location.reload()
    } catch {
      window.alert('Could not add these photos to the gallery.')
      setBusy(false)
    } finally {
      closeDrawer()
    }
  }

  async function pickFiles(event) {
    const files = event.target.files
    event.target.value = ''
    if (!files?.length) return
    setBusy(true)
    try {
      setQueue(await prepareUploadFiles(files))
    } catch {
      window.alert('Could not prepare these images.')
    } finally {
      setBusy(false)
    }
  }

  async function uploadQueue() {
    if (!queue.length) return
    setBusy(true)
    try {
      for (const item of queue) {
        const doc = await uploadPreparedFile(item.file)
        const id = mediaId(doc)
        const caption = item.file.name.replace(/\.[^.]+$/, '')
        await publishPhoto(id, caption)
      }
      queue.forEach((item) => URL.revokeObjectURL(item.preview))
      window.location.reload()
    } catch {
      window.alert('Upload failed.')
      setBusy(false)
    }
  }

  return (
    <div className="media-grid-field" style={{ marginBottom: '1.25rem' }}>
      <p className="media-grid-field__hint">
        Upload several photos, or choose existing ones. They show together on the public gallery. No category.
      </p>
      {queue.length > 0 && (
        <div className="media-grid-field__queue">
          <strong>Ready to upload ({queue.length})</strong>
          <div className="media-grid-field__grid">
            {queue.map((item, index) => (
              <article key={`${item.file.name}-${index}`}>
                <img src={item.preview} alt={item.file.name} />
                <small>
                  {item.resized
                    ? `${formatBytes(item.originalSize)} → ${formatBytes(item.finalSize)} resized`
                    : `${formatBytes(item.finalSize)} kept as-is`}
                </small>
              </article>
            ))}
          </div>
          <div className="media-grid-field__actions">
            <button type="button" onClick={uploadQueue} disabled={busy}>
              {busy ? 'Uploading…' : `Add ${queue.length} to gallery`}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                queue.forEach((item) => URL.revokeObjectURL(item.preview))
                setQueue([])
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {queue.length === 0 && (
        <div className="media-grid-field__actions">
          <label>
            Add images
            <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={pickFiles} />
          </label>
          <button type="button" onClick={openDrawer} disabled={busy}>
            From library
          </button>
        </div>
      )}
      <ListDrawer
        enableRowSelections
        onBulkSelect={(selected) => {
          const ids = []
          selected?.forEach?.((isSelected, id) => {
            if (isSelected) ids.push(id)
          })
          addIds(ids)
        }}
        onSelect={(args) => {
          const doc = args?.doc || args?.value || args
          addIds([mediaId(doc)], { [mediaId(doc)]: doc?.filename || doc?.alt })
        }}
      />
    </div>
  )
}
