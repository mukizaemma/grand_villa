import { useEffect, useMemo, useState } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { staffClient } from '../api/staffClient'
import StaffModal from '../components/StaffModal'
import '../staff.css'

function day(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function when(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function digits(phone) {
  return String(phone || '').replace(/[^\d]/g, '')
}

function inRange(iso, start, end) {
  if (!iso) return false
  const time = new Date(iso).setHours(0, 0, 0, 0)
  if (start && time < new Date(start).setHours(0, 0, 0, 0)) return false
  if (end && time > new Date(end).setHours(0, 0, 0, 0)) return false
  return true
}

function stayNights(row) {
  if (!row.checkIn || !row.checkOut) return 0
  const nights = Math.round((new Date(row.checkOut) - new Date(row.checkIn)) / 86400000)
  return nights > 0 ? nights : 0
}

function money(amount, currency = 'USD') {
  const value = Number(amount) || 0
  return `${currency} ${value.toFixed(2)}`
}

function sumAmount(list) {
  return list.reduce((sum, row) => (row.status === 'cancelled' ? sum : sum + Number(row.total || 0)), 0)
}

function sumNights(list) {
  return list.reduce((sum, row) => (row.status === 'cancelled' ? sum : sum + stayNights(row)), 0)
}

function staySummary(row) {
  const rooms = (row.rooms || []).map((room) => room.name).join(', ') || 'room'
  return `${row.guestName || 'Guest'} · ${rooms} · ${day(row.checkIn)} – ${day(row.checkOut)}`
}

function preferredChannel(row) {
  return row.confirmationMethod === 'whatsapp' ? 'whatsapp' : 'email'
}

export default function StaffReservations() {
  const today = new Date().toISOString().slice(0, 10)
  const [rows, setRows] = useState([])
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const [applied, setApplied] = useState({ start: '', end: '' })
  const [view, setView] = useState(null)
  const [draft, setDraft] = useState('')

  async function load() {
    try {
      const { data } = await staffClient.get('/api/bookings?limit=200&sort=-createdAt')
      setRows(data.docs || [])
    } catch {
      toast.error('Could not load reservations.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!applied.start && !applied.end) return rows
    return rows.filter((row) => inRange(row.createdAt, applied.start, applied.end))
  }, [rows, applied])

  const rangeAmount = sumAmount(filtered)
  const rangeNights = sumNights(filtered)
  const allAmount = sumAmount(rows)
  const currency = rows[0]?.currency || filtered[0]?.currency || 'USD'

  const stats = {
    total: filtered.length,
    whatsapp: filtered.filter((row) => row.confirmationMethod === 'whatsapp').length,
    email: filtered.filter((row) => row.confirmationMethod === 'email').length,
    confirmed: filtered.filter((row) => row.status === 'confirmed').length,
    pending: filtered.filter((row) => row.status === 'pending').length,
    allAmount,
  }

  async function save(id, payload) {
    const { data } = await staffClient.patch(`/api/bookings/${id}`, payload)
    const doc = data.doc || data
    setRows((current) => current.map((row) => (row.id === id ? doc : row)))
    setView(doc)
    return doc
  }

  async function addMessage(row, entry) {
    const communications = [
      ...(row.communications || []),
      { at: new Date().toISOString(), author: 'Staff', ...entry },
    ]
    await save(row.id, { communications })
    setDraft('')
  }

  async function replyToGuest(row) {
    const body = draft.trim()
    if (!body) return
    const channel = preferredChannel(row)
    const text = `Grand Villa Apartment\n${staySummary(row)}\n\n${body}`

    if (channel === 'whatsapp') {
      const phone = digits(row.guest?.mobile)
      if (!phone) {
        toast.error('This guest has no mobile number for WhatsApp.')
        return
      }
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    } else {
      if (!row.guest?.email) {
        toast.error('This guest has no email address.')
        return
      }
      window.open(
        `mailto:${row.guest.email}?subject=${encodeURIComponent(`Your booking at Grand Villa — ${row.guestName || ''}`)}&body=${encodeURIComponent(text)}`,
        '_blank',
      )
    }

    await addMessage(row, { direction: 'outbound', channel, body })
    toast.success(channel === 'whatsapp' ? 'WhatsApp opened and reply logged.' : 'Email opened and reply logged.')
  }

  async function logGuestReply(row) {
    const body = draft.trim()
    if (!body) return
    await addMessage(row, { direction: 'inbound', channel: preferredChannel(row), body })
    toast.success('Guest reply saved on this reservation.')
  }

  async function addNote(row) {
    const body = draft.trim()
    if (!body) return
    await addMessage(row, { direction: 'note', channel: 'internal', body })
    toast.success('Internal note saved.')
  }

  async function setStatus(id, status) {
    try {
      await save(id, { status })
      toast.success(`Marked ${status}.`)
    } catch {
      toast.error('Could not update this booking.')
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this reservation?')) return
    try {
      await staffClient.delete(`/api/bookings/${id}`)
      toast.success('Reservation deleted.')
      setView(null)
      load()
    } catch {
      toast.error('Could not delete this booking.')
    }
  }

  return (
    <div className="staffPage">
      <h1>Recent Bookings</h1>

      <div className="staffToolbar">
        <label className="staffField">
          Start date
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="staffField">
          End date
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button type="button" className="staffBtn" onClick={() => setApplied({ start, end })}>
          Search
        </button>
        <button type="button" className="staffBtn staffBtnGhost" onClick={() => setApplied({ start: '', end: '' })}>
          All bookings
        </button>
      </div>

      <div className="staffStats">
        <div className="staffStat">
          <span>Reservations</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="staffStat">
          <span>WhatsApp</span>
          <strong>{stats.whatsapp}</strong>
        </div>
        <div className="staffStat">
          <span>Email</span>
          <strong>{stats.email}</strong>
        </div>
        <div className="staffStat">
          <span>Confirmed</span>
          <strong>{stats.confirmed}</strong>
          <small>{stats.pending} pending</small>
        </div>
        <div className="staffStat staffStat--accent">
          <span>Total amount</span>
          <strong>{money(stats.allAmount, currency)}</strong>
          <small>{rows.length} booking{rows.length === 1 ? '' : 's'}</small>
        </div>
      </div>

      <div className="staffCard">
        <table className="staffTable">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Channel</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Days</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{when(row.createdAt)}</td>
                <td>
                  {row.guestName}
                  <div>
                    <span className={`badge ${row.status === 'confirmed' ? 'badgeConfirmed' : row.status === 'cancelled' ? 'badgeCancelled' : 'badgePending'}`}>
                      {row.status}
                    </span>
                  </div>
                </td>
                <td>{row.guest?.mobile || '—'}</td>
                <td>{row.confirmationMethod || '—'}</td>
                <td>{row.rooms?.[0]?.name || '—'}</td>
                <td>{day(row.checkIn)}</td>
                <td>{day(row.checkOut)}</td>
                <td>{stayNights(row)}</td>
                <td>{money(row.total, row.currency)}</td>
                <td>
                  <div className="rowActions">
                    <button
                      type="button"
                      className="iconBtn iconView"
                      onClick={() => {
                        setView(row)
                        setDraft('')
                      }}
                      aria-label="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button type="button" className="iconBtn iconDelete" onClick={() => remove(row.id)} aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10}>No reservations in this range.</td>
              </tr>
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={7}>Totals for this view</td>
                <td>{rangeNights}</td>
                <td>{money(rangeAmount, currency)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {view && (
        <StaffModal title="Reservation" wide onClose={() => setView(null)}>
          <div className="detailGrid">
            <p>
              <strong>Guest</strong>
              <br />
              {view.guestName}
            </p>
            <p>
              <strong>Contact</strong>
              <br />
              {view.guest?.mobile || '—'}
              <br />
              {view.guest?.email || '—'}
            </p>
            <p>
              <strong>Room</strong>
              <br />
              {view.rooms?.map((room) => room.name).join(', ') || '—'}
            </p>
            <p>
              <strong>Stay</strong>
              <br />
              {day(view.checkIn)} – {day(view.checkOut)} · {stayNights(view)} night
              {stayNights(view) === 1 ? '' : 's'}
            </p>
            <p>
              <strong>Payment</strong>
              <br />
              {view.currency} {view.total} · {view.paymentMethod}
            </p>
            <p className="full preferredNote">
              Guest asked to be contacted by <strong>{preferredChannel(view) === 'whatsapp' ? 'WhatsApp' : 'Email'}</strong>.
              If they reply outside this screen, paste the message below so the conversation stays on this reservation.
            </p>
            {view.guest?.specialRequests && (
              <p className="full">
                <strong>Requests</strong>
                <br />
                {view.guest.specialRequests}
              </p>
            )}
          </div>

          <div className="commThread">
            <strong>Conversation</strong>
            {(view.communications || []).length === 0 && <p>No messages yet.</p>}
            {(view.communications || []).map((item, index) => (
              <article key={item.id || index} className={`commMsg commMsg--${item.direction}`}>
                <header>
                  <span>
                    {item.direction === 'outbound'
                      ? 'Sent to guest'
                      : item.direction === 'inbound'
                        ? 'Guest reply'
                        : 'Internal note'}{' '}
                    · {item.channel} · {item.author || 'Staff'}
                  </span>
                  <span>{when(item.at)}</span>
                </header>
                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <label className="staffField full">
            Message
            <textarea
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a reply, log a guest message, or add an internal note…"
            />
          </label>

          <div className="formActions">
            <button type="button" className="staffBtn" onClick={() => replyToGuest(view)}>
              {preferredChannel(view) === 'whatsapp' ? 'Reply on WhatsApp' : 'Reply by Email'}
            </button>
            <button type="button" className="staffBtn staffBtnGhost" onClick={() => logGuestReply(view)}>
              Log guest reply
            </button>
            <button type="button" className="staffBtn staffBtnGhost" onClick={() => addNote(view)}>
              Add internal note
            </button>
            <button type="button" className="staffBtn staffBtnGhost" onClick={() => setStatus(view.id, 'pending')}>
              Pending
            </button>
            <button type="button" className="staffBtn" onClick={() => setStatus(view.id, 'confirmed')}>
              Confirm
            </button>
            <button type="button" className="staffBtn staffBtnDanger" onClick={() => remove(view.id)}>
              Delete
            </button>
          </div>
        </StaffModal>
      )}
    </div>
  )
}
