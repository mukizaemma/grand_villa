'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { FieldLabel, useField, useForm, useFormFields, useListDrawer } from '@payloadcms/ui'
import { formatBytes, prepareUploadFiles, uploadPreparedFile } from '../prepareImage.js'
import './mediaGridField.css'

function mediaId(value) {
  if (!value) return ''
  if (typeof value === 'object') return String(value.id || value._id || '')
  return String(value)
}

function mediaSrc(doc) {
  if (!doc || typeof doc !== 'object') return ''
  return doc.thumbnailURL || doc.sizes?.thumbnail?.url || doc.url || ''
}

function imageKey(field) {
  const upload = (field?.fields || []).find((item) => item.type === 'upload' || item.name === 'photo' || item.name === 'image')
  return upload?.name || 'photo'
}

export function MediaGridField({ field, path, readOnly }) {
  const key = useMemo(() => imageKey(field), [field])
  useField({ hasRows: true, path })
  const { addFieldRow, removeFieldRow } = useForm()
  const rowState = useFormFields(([fields]) => {
    const count = fields[path]?.rows?.length || Number(fields[path]?.value) || 0
    const parts = []
    for (let index = 0; index < count; index += 1) {
      const rowId = mediaId(fields[`${path}.${index}.id`]?.value) || String(index)
      const photoId = mediaId(fields[`${path}.${index}.${key}`]?.value)
      parts.push(`${rowId}:${photoId}`)
    }
    return parts.join('|')
  })
  const rows = useMemo(
    () =>
      rowState
        ? rowState.split('|').map((part) => {
            const splitAt = part.indexOf(':')
            return {
              id: part.slice(0, splitAt),
              photoId: part.slice(splitAt + 1),
            }
          })
        : [],
    [rowState],
  )
  const max = field?.maxRows || 24
  const [docs, setDocs] = useState({})
  const [queue, setQueue] = useState([])
  const [busy, setBusy] = useState(false)
  const [ListDrawer, , { openDrawer, closeDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    uploads: true,
  })

  useEffect(() => {
    const missing = [...new Set(rows.map((row) => row.photoId).filter((id) => id && !(id in docs)))]
    if (!missing.length) return undefined
    let cancelled = false
    Promise.all(
      missing.map((id) =>
        fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
          .then((res) => (res.ok ? res.json() : null))
          .then((doc) => [id, doc])
          .catch(() => [id, null]),
      ),
    ).then((pairs) => {
      if (cancelled) return
      setDocs((current) => {
        const next = { ...current }
        for (const [id, doc] of pairs) {
          next[id] = doc || current[id] || { id }
        }
        return next
      })
    })
    return () => {
      cancelled = true
    }
  }, [rows, docs])

  function remember(doc) {
    const id = mediaId(doc)
    if (!id || typeof doc !== 'object') return
    setDocs((current) => ({ ...current, [id]: doc }))
  }

  function addIds(ids, knownDocs = []) {
    knownDocs.forEach(remember)
    const known = new Set(rows.map((row) => row.photoId).filter(Boolean))
    let index = rows.length
    for (const raw of ids) {
      const id = mediaId(raw)
      if (!id || known.has(id) || index >= max) continue
      known.add(id)
      addFieldRow({
        path,
        rowIndex: index,
        subFieldState: {
          [key]: {
            initialValue: id,
            valid: true,
            value: id,
          },
        },
      })
      index += 1
    }
    closeDrawer()
  }

  async function pickFiles(event) {
    const files = event.target.files
    event.target.value = ''
    if (!files?.length) return
    const room = Math.max(0, max - rows.length)
    if (!room) return
    setBusy(true)
    try {
      setQueue(await prepareUploadFiles(Array.from(files).slice(0, room)))
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
      const uploaded = []
      for (const item of queue) {
        uploaded.push(await uploadPreparedFile(item.file))
      }
      addIds(
        uploaded.map((doc) => doc.id || doc),
        uploaded,
      )
      queue.forEach((item) => URL.revokeObjectURL(item.preview))
      setQueue([])
    } catch {
      window.alert('Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  function removeAt(index) {
    removeFieldRow({ path, rowIndex: index })
  }

  return (
    <div className="media-grid-field">
      <FieldLabel label={field?.label || field?.labels?.plural || 'Photos'} path={path} />
      <p className="media-grid-field__hint">
        Add several photos at once. Files over 700KB are resized before upload.
      </p>

      <div className="media-grid-field__grid">
        {rows.map((row, index) => {
          const src = mediaSrc(docs[row.photoId])
          return (
            <article key={row.id || index}>
              {src ? <img src={src} alt="" /> : <div className="media-grid-field__empty">Photo {index + 1}</div>}
              {!readOnly && (
                <button type="button" onClick={() => removeAt(index)}>
                  Remove
                </button>
              )}
            </article>
          )
        })}
      </div>

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
              {busy ? 'Uploading…' : `Upload ${queue.length}`}
            </button>
            <button
              type="button"
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

      {!readOnly && rows.length < max && queue.length === 0 && (
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
          addIds([mediaId(doc)], [doc])
        }}
      />
    </div>
  )
}
