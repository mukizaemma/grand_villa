'use client'

import React, { useState } from 'react'
import {
  Button,
  DefaultListView,
  Gutter,
  ListControls,
  PageControls,
  useConfig,
  useListDrawerContext,
  useListQuery,
  useModal,
} from '@payloadcms/ui'
import './mediaLibraryList.css'

function labelText(value, fallback) {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value.en || fallback
}

function thumb(doc) {
  if (!doc) return ''
  if (doc.mimeType?.startsWith('video/')) return ''
  return doc.thumbnailURL || doc.sizes?.thumbnail?.url || doc.url || ''
}

export function MediaLibraryList(props) {
  const { isInDrawer } = useListDrawerContext()
  if (!isInDrawer) return <DefaultListView {...props} />
  return <MediaPickerGrid {...props} />
}

function MediaPickerGrid({
  collectionSlug,
  disableQueryPresets,
  enableRowSelections,
  hasCreatePermission,
  listMenuItems,
  queryPreset,
  queryPresetPermissions,
  renderedFilters,
  resolvedFilterOptions,
}) {
  const { getEntityConfig } = useConfig()
  const collectionConfig = getEntityConfig({ collectionSlug })
  const { data } = useListQuery()
  const { allowCreate, createNewDrawerSlug, onBulkSelect, onSelect } = useListDrawerContext()
  const { openModal } = useModal()
  const [picked, setPicked] = useState(() => new Set())
  const docs = data?.docs || []
  const multiple = Boolean(enableRowSelections && typeof onBulkSelect === 'function')
  const title = labelText(collectionConfig?.labels?.plural, 'Media Gallery')

  const pickedCount = picked.size
  const canCreate = allowCreate !== false && hasCreatePermission

  const hint = multiple
    ? 'Select one or more images, then add them.'
    : 'Select one image.'

  function toggle(doc) {
    if (!multiple) {
      onSelect?.({
        collectionSlug,
        doc,
        docID: doc.id,
      })
      return
    }
    setPicked((current) => {
      const next = new Set(current)
      if (next.has(doc.id)) next.delete(doc.id)
      else next.add(doc.id)
      return next
    })
  }

  function addSelected() {
    if (!pickedCount) return
    const selected = new Map()
    picked.forEach((id) => selected.set(id, true))
    onBulkSelect?.(selected)
  }

  return (
    <Gutter className="media-library-grid">
      <div className="media-library-grid__bar">
        <div>
          <h2>{title}</h2>
          <p>{hint}</p>
        </div>
        <div className="media-library-grid__bar-actions">
          {multiple ? (
            <Button buttonStyle="primary" disabled={!pickedCount} onClick={addSelected} size="small" type="button">
              {pickedCount ? `Add ${pickedCount} selected` : 'Add selected'}
            </Button>
          ) : null}
          {canCreate ? (
            <Button
              buttonStyle="secondary"
              onClick={() => openModal(createNewDrawerSlug)}
              size="small"
              type="button"
            >
              Create New
            </Button>
          ) : null}
        </div>
      </div>

      <ListControls
        collectionConfig={collectionConfig}
        collectionSlug={collectionSlug}
        disableQueryPresets={collectionConfig?.enableQueryPresets !== true || disableQueryPresets}
        enableColumns={false}
        listMenuItems={listMenuItems}
        queryPreset={queryPreset}
        queryPresetPermissions={queryPresetPermissions}
        renderedFilters={renderedFilters}
        resolvedFilterOptions={resolvedFilterOptions}
      />

      {docs.length === 0 ? (
        <p className="media-library-grid__empty">No files match this search.</p>
      ) : (
        <div className="media-library-grid__tiles">
          {docs.map((doc) => {
            const src = thumb(doc)
            const on = multiple && picked.has(doc.id)
            const name = doc.filename || doc.alt || 'Untitled'
            return (
              <button
                key={doc.id}
                type="button"
                className={`media-library-grid__tile${on ? ' is-selected' : ''}`}
                aria-pressed={multiple ? on : undefined}
                onClick={() => toggle(doc)}
              >
                {src ? (
                  <img src={src} alt={doc.alt || name} />
                ) : (
                  <span className="media-library-grid__fallback">
                    {doc.mimeType?.startsWith('video/') ? 'Video' : 'No preview'}
                  </span>
                )}
                {on ? <span className="media-library-grid__check">Selected</span> : null}
                <span className="media-library-grid__name">{name}</span>
              </button>
            )
          })}
        </div>
      )}

      {docs.length > 0 ? <PageControls collectionConfig={collectionConfig} /> : null}

      {multiple && pickedCount > 0 ? (
        <div className="media-library-grid__confirm">
          <span>
            {pickedCount} image{pickedCount === 1 ? '' : 's'} selected
          </span>
          <Button buttonStyle="primary" onClick={addSelected} size="small" type="button">
            Add {pickedCount} selected
          </Button>
        </div>
      ) : null}
    </Gutter>
  )
}
