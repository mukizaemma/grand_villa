import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FEATURE_LIBRARY } from '@features/hotel/rooms/featureLibrary'
import { mediaUrl } from '@features/hotel/adapters'
import { asHtml, htmlToLexical, isBlankHtml } from '@lib/richText'
import { staffClient, mediaId } from '../api/staffClient'
import { slugify } from '../lib/slugify'
import MediaGalleryField from '../components/MediaGalleryField'
import StaffModal from '../components/StaffModal'
import SummernoteField from '../components/SummernoteField'
import '../staff.css'

const empty = {
  name: '',
  slug: '',
  pricePerNight: '',
  units: 1,
  description: '',
  specs: { size: '', bed: '', occupancy: '', view: '', smoking: '', breakfast: '' },
  features: [],
  gallery: [],
}

const SPEC_FIELDS = [
  { key: 'size', label: 'Size', hint: 'e.g. 28 m²' },
  { key: 'bed', label: 'Bed', hint: 'King / Twin' },
  { key: 'occupancy', label: 'Guests', hint: '2 adults' },
  { key: 'view', label: 'View', hint: 'City / Garden' },
  { key: 'smoking', label: 'Smoking', hint: 'No' },
  { key: 'breakfast', label: 'Breakfast', hint: 'Included' },
]

export default function StaffRooms() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(null)

  async function load() {
    const { data } = await staffClient.get('/api/rooms?limit=100&depth=1')
    setRows(data.docs || [])
  }

  useEffect(() => {
    load().catch(() => toast.error('Could not load rooms.'))
  }, [])

  function openCreate() {
    setForm({ ...empty, specs: { ...empty.specs } })
  }

  function openEdit(row) {
    setForm({
      id: row.id,
      name: row.name || '',
      slug: row.slug || '',
      pricePerNight: row.pricePerNight || '',
      units: row.units || 1,
      description: asHtml(row.description),
      specs: { ...empty.specs, ...row.specs },
      features: row.features || [],
      gallery: (row.gallery || []).map((item) => item.photo).filter(Boolean).length
        ? (row.gallery || []).map((item) => item.photo).filter(Boolean)
        : row.image
          ? [row.image]
          : [],
    })
  }

  async function save(event) {
    event.preventDefault()
    if (isBlankHtml(form.description)) {
      toast.error('Add a short room description.')
      return
    }
    const gallery = (form.gallery || []).map((item) => mediaId(item)).filter(Boolean)
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      pricePerNight: Number(form.pricePerNight),
      units: Math.max(1, Number(form.units) || 1),
      description: htmlToLexical(form.description),
      specs: form.specs,
      features: form.features,
      image: gallery[0] || undefined,
      gallery: gallery.map((photo) => ({ photo })),
    }
    try {
      if (form.id) await staffClient.patch(`/api/rooms/${form.id}`, payload)
      else await staffClient.post('/api/rooms', payload)
      toast.success('Room saved.')
      setForm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not save the room.')
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this room?')) return
    try {
      await staffClient.delete(`/api/rooms/${id}`)
      toast.success('Room deleted.')
      load()
    } catch {
      toast.error('Could not delete this room.')
    }
  }

  return (
    <div className="staffPage">
      <h1>Accommodation</h1>
      <p className="staffLead">
        Add or edit rooms in a modal. Set how many physical rooms sit in each type so the website
        only closes a night when that type is full, or when one room is left.
      </p>
      <div className="staffToolbar">
        <button type="button" className="staffBtn" onClick={openCreate}>
          Add room
        </button>
      </div>
      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Rooms of this type</th>
              <th>Price / night</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {mediaUrl(row.image) ? (
                    <img src={mediaUrl(row.image)} alt="" className="staffThumb" />
                  ) : (
                    <span className="staffThumbEmpty" />
                  )}
                </td>
                <td>{row.name}</td>
                <td>{row.units || 1}</td>
                <td>${row.pricePerNight}</td>
                <td>
                  <div className="rowActions">
                    <button type="button" className="staffBtn" onClick={() => openEdit(row)}>
                      Edit
                    </button>
                    <button type="button" className="staffBtn staffBtnDanger" onClick={() => remove(row.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <StaffModal title={form.id ? 'Edit room' : 'Add room'} wide onClose={() => setForm(null)}>
          <form onSubmit={save} className="formGrid">
            <label className="staffField col-3">
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="staffField col-3">
              Price / night
              <input
                type="number"
                value={form.pricePerNight}
                onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                required
              />
            </label>
            <label className="staffField col-3">
              Rooms of this type
              <input
                type="number"
                min="1"
                value={form.units}
                onChange={(e) => setForm({ ...form, units: e.target.value })}
                required
              />
            </label>
            <SummernoteField
              key={form.id || 'new-room'}
              className="col-8"
              label="Description"
              value={form.description}
              onChange={(description) => setForm((current) => ({ ...current, description }))}
            />
            <MediaGalleryField
              label="Room photos"
              values={form.gallery}
              onChange={(gallery) => setForm({ ...form, gallery })}
              max={12}
            />
            {SPEC_FIELDS.map(({ key, label, hint }) => (
              <label key={key} className="staffField col-3">
                {label}
                <input
                  placeholder={hint}
                  value={form.specs[key]}
                  onChange={(e) => setForm({ ...form, specs: { ...form.specs, [key]: e.target.value } })}
                />
              </label>
            ))}
            <div className="staffField col-8">
              Features
              <div className="featureGrid">
                {Object.entries(FEATURE_LIBRARY).map(([key, label]) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={form.features.includes(key)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...form.features, key]
                          : form.features.filter((item) => item !== key)
                        setForm({ ...form, features: next })
                      }}
                    />{' '}
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="formActions full">
              <button type="button" className="staffBtn staffBtnGhost" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="staffBtn">
                Save
              </button>
            </div>
          </form>
        </StaffModal>
      )}
    </div>
  )
}
