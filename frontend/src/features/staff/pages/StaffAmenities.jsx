import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { asHtml, asPlain, htmlToLexical } from '@lib/richText'
import { mediaUrl } from '@features/hotel/adapters'
import { staffClient, mediaId } from '../api/staffClient'
import { slugify } from '../lib/slugify'
import MediaField from '../components/MediaField'
import RowActions from '../components/RowActions'
import StaffModal from '../components/StaffModal'
import SummernoteField from '../components/SummernoteField'
import '../staff.css'

const empty = { name: '', slug: '', icon: 'wifi', description: '', image: '', sort: 0 }

export default function StaffAmenities() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(null)
  const [view, setView] = useState(null)

  function openEdit(row) {
    setForm({
      id: row.id,
      name: row.name || '',
      slug: row.slug || '',
      icon: row.icon || 'wifi',
      description: asHtml(row.description),
      image: row.image || '',
      sort: row.sort ?? 0,
    })
  }

  async function load() {
    const { data } = await staffClient.get('/api/amenities?limit=100&sort=sort&depth=1')
    setRows(data.docs || [])
  }

  useEffect(() => {
    load().catch(() => toast.error('Could not load amenities.'))
  }, [])

  async function save(event) {
    event.preventDefault()
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      icon: form.icon,
      sort: Number(form.sort) || 0,
      description: htmlToLexical(form.description),
      image: mediaId(form.image) || undefined,
    }
    try {
      if (form.id) await staffClient.patch(`/api/amenities/${form.id}`, payload)
      else await staffClient.post('/api/amenities', payload)
      toast.success('Amenity saved.')
      setForm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || 'Could not save.')
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this amenity?')) return
    try {
      await staffClient.delete(`/api/amenities/${id}`)
      load()
    } catch {
      toast.error('Could not delete.')
    }
  }

  return (
    <div className="staffPage">
      <h1>Amenities</h1>
      <p className="staffLead">Hotel extras shown on the public site. The name creates the URL automatically.</p>
      <div className="staffToolbar">
        <button type="button" className="staffBtn" onClick={() => setForm({ ...empty })}>
          Add amenity
        </button>
      </div>
      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Icon</th>
              <th>Actions</th>
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
                <td>{row.icon}</td>
                <td>
                  <RowActions onView={() => setView(row)} onEdit={() => openEdit(row)} onDelete={() => remove(row.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {view && (
        <StaffModal title={view.name || 'Amenity'} onClose={() => setView(null)}>
          <div className="detailGrid">
            <p><strong>Icon</strong><br />{view.icon || '—'}</p>
            <p><strong>Order</strong><br />{view.sort ?? 0}</p>
            <p className="full"><strong>Description</strong><br />{asPlain(view.description) || '—'}</p>
          </div>
          <div className="formActions full">
            <button type="button" className="staffBtn staffBtnGhost" onClick={() => setView(null)}>Close</button>
            <button type="button" className="staffBtn" onClick={() => { openEdit(view); setView(null) }}>Edit</button>
          </div>
        </StaffModal>
      )}

      {form && (
        <StaffModal title={form.id ? 'Edit amenity' : 'Add amenity'} wide onClose={() => setForm(null)}>
          <form onSubmit={save} className="formGrid">
            <label className="staffField col-3">
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="staffField col-3">
              Icon
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </label>
            <label className="staffField col-3">
              Order
              <input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })} />
            </label>
            <SummernoteField
              key={form.id || 'new-amenity'}
              className="col-8"
              label="Description"
              value={form.description}
              onChange={(description) => setForm((current) => ({ ...current, description }))}
            />
            <div className="mediaSlot">
              <MediaField label="Photo" value={form.image} onChange={(image) => setForm({ ...form, image })} />
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
